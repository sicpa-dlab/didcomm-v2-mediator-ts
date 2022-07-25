import { DidcommModule } from '@common/didcomm'
import { LoggerModule } from '@common/logger'
import { Module } from '@nestjs/common'
import { AgentModule } from '../agent'
import { MediatorController } from './mediator.controller'
import { DidListService } from './services/did-list.service'
import { MediationService } from './services/mediation.service'
import { MessagePickupService } from './services/message-pickup.service'
import { RouterService } from './services/router.service'

@Module({
  imports: [
    LoggerModule.forFeature([
      RouterService,
      MediationService,
      DidListService,
      MessagePickupService,
      MediatorController,
    ]),
    DidcommModule,
    AgentModule,
  ],
  controllers: [MediatorController],
  providers: [RouterService, MediationService, DidListService, MessagePickupService],
})
export class MediatorModule {}
