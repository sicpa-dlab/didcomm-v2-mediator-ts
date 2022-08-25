import HealthConfig from '@config/health'
import { InjectLogger, Logger } from '@logger'
import { Controller, Get } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { HealthCheck, HealthCheckResult, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus'
import { throwError } from '@utils/common'

@Controller('health')
export class HealthController {
  private readonly healthConfig: ConfigType<typeof HealthConfig>

  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    @InjectLogger(HealthController)
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    const _logger = this.logger.child('constructor')
    _logger.trace('>')

    this.healthConfig =
      configService.get<ConfigType<typeof HealthConfig>>('health') ?? throwError('Health config is not defined')

    _logger.trace('<')
  }

  @Get()
  @HealthCheck()
  public async check(): Promise<HealthCheckResult> {
    const _logger = this.logger.child('check')
    const { memoryHeapThresholdMb, memoryRSSThresholdMb } = this.healthConfig
    const memory = process.memoryUsage().heapUsed / 1024 / 1024
    const result = await this.healthCheckService.check([
      () => this.memoryHealthIndicator.checkHeap('memory_heap', memoryHeapThresholdMb * 1024 * 1024),
      () => this.memoryHealthIndicator.checkRSS('memory_rss', memoryRSSThresholdMb * 1024 * 1024),
    ])
    _logger.info({ memory: `Memory Usage (health check): ${memory} MB` })
    return result
  }
}
