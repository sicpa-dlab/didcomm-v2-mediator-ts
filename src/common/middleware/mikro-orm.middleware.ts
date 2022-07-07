import { MikroORM, RequestContext } from '@mikro-orm/core'
import { Injectable, NestMiddleware } from '@nestjs/common'

@Injectable()
export class MikroOrmMiddleware implements NestMiddleware {
  constructor(private readonly orm: MikroORM) {}

  public use(req: any, res: any, next: () => void) {
    RequestContext.create(this.orm.em, next as any)
  }
}
