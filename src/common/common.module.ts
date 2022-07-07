import { MikroOrmMiddleware } from '@common/middleware'
import { LoggerFactory, LoggerModule } from '@logger'
import { ReflectMetadataProvider } from '@mikro-orm/core'
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { MikroOrmModule } from '@mikro-orm/nestjs'
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
        return {
          ...configService.get<any>('mikro-orm'),
          entities: Object.values(entities),
          logger: (message: string) => logger.trace(message),
          driverOptions: {
            connection: {
              timezone: 'Z',
            },
          },
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
  ],
})
export class CommonModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(MikroOrmMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}