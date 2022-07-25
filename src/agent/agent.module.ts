import { LoggerModule } from '@common/logger'
import { Module } from '@nestjs/common'
import { AgentService } from './agent.service'

@Module({
  imports: [LoggerModule.forFeature([AgentService])],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
