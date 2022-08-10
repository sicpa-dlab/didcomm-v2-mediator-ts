import { LoggerModule } from '@logger'
import { Module } from '@nestjs/common'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './health.controller'

@Module({
  imports: [TerminusModule, LoggerModule.forFeature([HealthController])],
  controllers: [HealthController],
})
export class HealthModule {}
