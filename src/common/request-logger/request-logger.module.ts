import { LoggerModule } from '@logger'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { RequestLoggerInterceptor } from './request-logger.interceptor'

@Module({
  imports: [LoggerModule.forFeature([RequestLoggerInterceptor])],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor,
    },
  ],
})
export class RequestLoggerModule {}
