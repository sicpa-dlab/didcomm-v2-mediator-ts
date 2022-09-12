import { DidcommModule } from '@common/didcomm'
import { HealthModule } from '@common/health'
import { MikroOrmMiddleware } from '@common/middleware'
import { VersionModule } from '@common/version'
import { LoggerFactory, LoggerModule } from '@logger'
import { ReflectMetadataProvider } from '@mikro-orm/core'
import { MikroOrmModule } from '@mikro-orm/nestjs'
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { throwError } from '@utils/common'
import config from '../config'
import * as entities from './entities'
import { RequestLoggerModule } from './request-logger'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: config,
    }),
    MikroOrmModule.forRootAsync({
      useFactory: (configService: ConfigService, loggerFactory: LoggerFactory) => {
        const logger = loggerFactory.getLogger().child('MikroORM')
        const mikroOrmConfig = configService.get<any>('mikro-orm') ?? throwError('MikroORM config is not defined')
        return {
          ...mikroOrmConfig,
          entities: Object.values(entities),
          logger: (message: string) => logger.trace(message),
          metadataProvider: ReflectMetadataProvider,
          cache: {
            enabled: false,
          },
          debug: false,
        }
      },
      inject: [ConfigService, LoggerFactory],
      imports: [LoggerModule],
    }),
    RequestLoggerModule,
    DidcommModule,
    HealthModule,
    VersionModule,
  ],
})
export class CommonModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MikroOrmMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}
