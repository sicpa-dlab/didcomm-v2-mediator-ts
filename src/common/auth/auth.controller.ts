import { InjectLogger, Logger } from '@logger'
import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @InjectLogger(AuthController)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }
}
