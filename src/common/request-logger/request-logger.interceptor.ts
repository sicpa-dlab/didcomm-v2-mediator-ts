import { InjectLogger, Logger } from '@logger'
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'

interface ReqInfo {
  method: string
  url: string
  body: any
  headers: any
}

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly excludePaths: string[]

  constructor(
    @InjectLogger(RequestLoggerInterceptor)
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    this.excludePaths = configService.get('logging.excludePaths', [])
  }

  public intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [info, time] = this.logReq(context)

    return next.handle().pipe(
      tap(() => {
        this.logRes(context, info, time)
      }),
      catchError((err) => {
        this.logRes(context, info, time, err)
        return throwError(err)
      }),
    )
  }

  public logReq(context: ExecutionContext): [ReqInfo, number] {
    const logger = this.logger.child('logReq')

    const request = context.switchToHttp().getRequest()

    const time = Date.now()
    const { method, url, body, headers } = request

    const req = { method, url, body, headers }
    const msg = `[${method}] ${url}`
    if (!this.exclude(url)) {
      logger.info({ msg, req })
    }

    return [req, time]
  }

  public logRes(context: ExecutionContext, req: ReqInfo, time: number, err?: any): void {
    const logger = this.logger.child('logRes')

    const response = context.switchToHttp().getResponse()

    const delay = Date.now() - time
    const { method, url } = req
    const status = response.statusCode

    const res = { method, url, status, delay }
    const msg = `${status} | [${method}] ${url} - ${delay}ms`
    if (err) {
      if (response.statusCode >= 500) {
        logger.error({ err, msg, req, res })
      } else {
        logger.info({ err, msg, req, res })
      }
    } else {
      if (!this.exclude(url)) {
        logger.info({ msg, req, res })
      }
    }
  }

  private exclude(url: any): boolean {
    const urlStr = url as string
    return this.excludePaths.some((path) => urlStr.endsWith(path))
  }
}
