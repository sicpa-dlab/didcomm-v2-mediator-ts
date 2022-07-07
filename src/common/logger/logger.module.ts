import { DynamicModule, Module, Type } from '@nestjs/common'
import { LoggerFactory } from './logger.factory'

@Module({
  providers: [LoggerFactory],
  exports: [LoggerFactory],
})
export class LoggerModule {
  public static forFeature(types: Type<any>[]): DynamicModule {
    const providers = types.map((type) => ({
      provide: `${type.name}Logger`,
      useFactory: (loggerFactory: LoggerFactory) => {
        const logger = loggerFactory.getLogger()
        return logger.child(type.name)
      },
      inject: [LoggerFactory],
    }))

    return {
      module: LoggerModule,
      providers,
      exports: providers,
    }
  }
}
