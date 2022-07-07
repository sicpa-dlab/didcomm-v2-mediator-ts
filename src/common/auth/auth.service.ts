import { InjectLogger, Logger } from '@logger'
import { Injectable, NotImplementedException } from '@nestjs/common'
import { AuthInfo, TokenPayload } from './interfaces'

@Injectable()
export class AuthService {
  constructor(
    @InjectLogger(AuthService)
    private readonly logger: Logger, // private readonly em: EntityManager, // private readonly jwtService: JwtService,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async validateToken(tokenPayload: TokenPayload): Promise<AuthInfo> {
    throw new NotImplementedException()
  }
}
