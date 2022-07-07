import { InjectLogger, Logger } from '@logger'
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class CustomAuthGuard extends AuthGuard('custom') {
  constructor(
    @InjectLogger(CustomAuthGuard)
    private readonly logger: Logger,
  ) {
    super()
    this.logger.child('constructor').trace('<>')
  }

  public canActivate(executionContext: ExecutionContext) {
    const logger = this.logger.child('canActivate')
    logger.trace('>')

    const res = super.canActivate(executionContext)
    logger.trace('<')
    return res
  }

  public handleRequest(err: any, authData: any, info: any) {
    const logger = this.logger.child('handleRequest', { err, authData, info })
    logger.trace('>')

    if (err) {
      logger.warn({ err }, '! error')
      throw err
    }

    if (!authData) {
      const e = new UnauthorizedException()
      logger.warn({ err: e }, '! unauthorized')
      throw e
    }

    const res = authData
    logger.trace({ res }, '<')
    return res
  }
}
