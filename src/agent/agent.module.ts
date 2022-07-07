import { LoggerModule } from '@common/logger'
import { Module } from '@nestjs/common'
import { AgentController } from './agent.controller'
import { AgentService } from './agent.service'

@Module({
  imports: [LoggerModule.forFeature([AgentService, AgentController])],
  controllers: [AgentController],
  providers: [AgentService],
})
export class AgentModule {}
