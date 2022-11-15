import { DidcommModule } from '@common/didcomm'
import { LoggerModule } from '@common/logger'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { AgentModule } from '../agent'
import { MediatorController } from './mediator.controller'
import { MediatorGateway } from './mediator.gateway'
import { DeliveryService } from './services/delivery.service'
import { DidListService } from './services/did-list.service'
import { DiscoverFeaturesService } from './services/discover-features.service'
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
      MediatorGateway,
      DeliveryService,
      DiscoverFeaturesService,
    ]),
    HttpModule,
    DidcommModule,
    AgentModule,
  ],
  controllers: [MediatorController],
  providers: [
    RouterService,
    MediationService,
    DidListService,
    MessagePickupService,
    DeliveryService,
    MediatorGateway,
    DiscoverFeaturesService,
  ],
})
export class MediatorModule {}
