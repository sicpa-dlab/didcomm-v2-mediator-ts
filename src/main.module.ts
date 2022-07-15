import { AuthModule } from '@common/auth'
import { DidcommModule } from '@common/didcomm'
import { LoggerFactory } from '@logger'
import { ClassSerializerInterceptor, Module, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AgentModule } from './agent'
import { CommonModule } from './common'

@Module({
  imports: [CommonModule, AgentModule, AuthModule, DidcommModule],
})
export class MainModule {
  public static async bootstrap() {
    const loggerFactory = new LoggerFactory()
    const logger = loggerFactory.getLogger().child(MainModule.name).child('bootstrap')

    logger.trace('>')

    const memBefore = process.memoryUsage().heapUsed / 1024 / 1024
    logger.info(`Memory Usage (before startup): ${memBefore} MB`)

    const app = await NestFactory.create(MainModule, {
      logger: loggerFactory.getNestLogger(),
    })

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    )

    app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()))

    const config = app.get(ConfigService)

    const expressConfig = config.get('express')
    logger.traceObject({ expressConfig })

    if (expressConfig.enableCors) {
      app.enableCors(expressConfig.corsOptions)
    }

    app.setGlobalPrefix(expressConfig.prefix)

    const options = new DocumentBuilder()
      .setTitle(`Cloud agent mediator`)
      // .addTag('Auth')
      .addTag('Agents')
      .setDescription(`Cloud agent mediator`)
      .setVersion('1')
      // .addBearerAuth()
      .build()

    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup(`${expressConfig.prefix}/docs`, app, document)

    await app.listen(expressConfig.port)

    const memAfter = process.memoryUsage().heapUsed / 1024 / 1024
    logger.info(`Memory Usage (after startup): ${memAfter} MB`)
  }
}
