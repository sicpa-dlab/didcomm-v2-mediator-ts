import { Inject, Injectable, LoggerService as INestLogger, Type } from '@nestjs/common'
import { undefinedToNull } from '@utils/object'
import pino from 'pino'
import pinoConfig from '../../config/pino'

@Injectable()
export class LoggerFactory {
  private readonly rootLogger: pino.Logger

  // Note: we don't use ConfigService and read configuration directly because
  // we need logger to be created
  // before container initialization.
  constructor() {
    this.rootLogger = pino(pinoConfig())
  }

  public getLogger(): Logger {
    return new Logger(this.rootLogger)
  }

  public getNestLogger(): NestLogger {
    return new NestLogger(new Logger(this.rootLogger))
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
