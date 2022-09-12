import ExpressConfig from '@config/express'
import { InjectLogger, Logger } from '@logger'
import { Controller, Get } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { throwError } from '@utils/common'
import { version as didcommVersion } from 'didcomm/package.json'

@Controller('version')
export class VersionController {
  private readonly expressConfig: ConfigType<typeof ExpressConfig>

  constructor(
    @InjectLogger(VersionController)
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    const _logger = this.logger.child('constructor')
    _logger.trace('>')

    this.expressConfig =
      configService.get<ConfigType<typeof ExpressConfig>>('express') ?? throwError('Express config is not defined')

    _logger.trace('<')
  }

  @Get()
  public async getVersion() {
    return { app: this.expressConfig.version, didcomm: didcommVersion }
  }
}
