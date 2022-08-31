import PinoConfig from '@config/pino'
import { Inject, Injectable, LoggerService as INestLogger, Type } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { undefinedToNull } from '@utils/object'
import path from 'path'
import pino from 'pino'

@Injectable()
export class LoggerFactory {
  private readonly rootLogger: pino.Logger

  // Note: we don't use ConfigService and read configuration directly because
  // we need logger to be created
  // before container initialization.
  constructor() {
    const transport = this.createPinoTransport(PinoConfig())
    this.rootLogger = pino(transport)
  }

  public getLogger(): Logger {
    return new Logger(this.rootLogger)
  }

  public getNestLogger(): NestLogger {
    return new NestLogger(new Logger(this.rootLogger))
  }

  private createPinoTransport(config: ConfigType<typeof PinoConfig>) {
    const { level, redact, logFilePath } = config

    // We want to use 'pino/pretty' target in dev environment, but it's recommended to not use for in production cases
    // README link: https://github.com/pinojs/pino-pretty#programmatic-integration
    // const target = process.env.NODE_ENV === 'production' ? 'pino/file' : 'pino-pretty'
    const target = 'pino-pretty'
    const logFileDestination = path.join(process.cwd(), logFilePath)

    return pino.transport({
      targets: [
        {
          target,
          level,
          options: { destination: logFileDestination, mkdir: true, colorize: false, redact },
        },
        { target, level, options: { redact } },
      ],
    })
  }
}

export const InjectLogger = (type: Type) => Inject(`${type.name}Logger`)

export class Logger {
  constructor(private readonly logger: pino.Logger, private readonly level: number = 0) {}

  public traceObject(obj: object) {
    undefinedToNull(obj)
    const keys = Object.keys(obj).join(', ')
    this.trace(obj, `? ${keys}`)
  }

  public trace(mergeObjOrMsg: object | string, ...args: any[]) {
    this.logger.trace(mergeObjOrMsg as any, ...args)
  }

  public debug(mergeObjOrMsg: object | string, ...args: any[]) {
    this.logger.debug(mergeObjOrMsg as any, ...args)
  }

  public info(mergeObjOrMsg: object | string, ...args: any[]) {
    this.logger.info(mergeObjOrMsg as any, ...args)
  }

  public warn(mergeObjOrMsg: object | string, ...args: any[]) {
    this.logger.warn(mergeObjOrMsg as any, ...args)
  }

  public error(mergeObjOrMsg: object | string, ...args: any[]) {
    this.logger.error(mergeObjOrMsg as any, ...args)
  }

  public child(cnxt: string, obj?: object): Logger {
    return new Logger(this.logger.child({ [`context-${this.level}`]: cnxt, ...obj }), this.level + 1)
  }
}

export class NestLogger implements INestLogger {
  private readonly logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  public log(msg: any, context?: string) {
    const _logger = context ? this.logger.child(context) : this.logger
    _logger.info(msg)
  }

  public error(msg: any, trace?: string, context?: string) {
    const _logger = context ? this.logger.child(context) : this.logger
    _logger.error(msg, trace)
  }

  public warn(msg: any, context?: string) {
    const _logger = context ? this.logger.child(context) : this.logger
    _logger.warn(msg)
  }
}
