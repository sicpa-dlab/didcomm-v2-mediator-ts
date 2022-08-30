import ExpressConfig from '@config/express'
import { LoggerFactory } from '@logger'
import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WsAdapter } from '@nestjs/platform-ws'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { notify } from '@utils/mattermost'
import bodyParser from 'body-parser'
import path from 'path'
import { AgentModule } from './agent'
import { CommonModule } from './common'
import { MediatorModule } from './mediator'

@Module({
  imports: [CommonModule, MediatorModule, AgentModule],
})
export class MainModule {
  public static async bootstrap() {
    const loggerFactory = new LoggerFactory()
    const logger = loggerFactory.getLogger().child(MainModule.name).child('bootstrap')

    logger.trace('>')

    const memBefore = process.memoryUsage().heapUsed / 1024 / 1024
    logger.info(`Memory Usage (before startup): ${memBefore} MB`)

    // We read config directly as we want to get Express config before 'NestFactory.create' call
    const expressConfig = ExpressConfig()
    logger.traceObject({ expressConfig })

    const app = await NestFactory.create<NestExpressApplication>(MainModule, {
      logger: loggerFactory.getNestLogger(),
      bodyParser: true,
      httpsOptions: expressConfig.httpsOptions,
    })

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )

    app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()))

    if (expressConfig.enableCors) {
      app.enableCors(expressConfig.corsOptions)
    }

    // 'type' option used as workaround to parse custom Content-Type as json https://github.com/nestjs/nest/issues/2625
    app.use(bodyParser.json({ type: expressConfig.jsonContentHeaders, limit: expressConfig.requestSizeLimit }))

    app.setGlobalPrefix(expressConfig.prefix)

    app.useWebSocketAdapter(new WsAdapter(app))

    const options = new DocumentBuilder()
      .setTitle(`Cloud agent mediator`)
      .addTag('Mediator')
      .setDescription(`Cloud agent mediator`)
      .setVersion('1')
      .build()

    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup(`${expressConfig.prefix}/docs`, app, document)

    app.useStaticAssets(path.join(__dirname, '..', 'public'))

    await app.listen(expressConfig.port)

    const memAfter = process.memoryUsage().heapUsed / 1024 / 1024
    logger.info(`Memory Usage (after startup): ${memAfter} MB`)

    if (process.env.NODE_ENV === 'production') {
      await notify()
    }
  }
}
