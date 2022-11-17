import { DidcommForwardMessage, DidcommMessage, DidcommService } from '@common/didcomm'
import { EncryptedMessage } from '@common/didcomm/messages'
import { SignedMessage } from '@common/didcomm/messages/signed.message'
import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { IMessage } from 'didcomm-node'
import { KeyListQueryMessage, KeyListUpdateMessage } from '../messages/key-list'
import { QueriesMessage } from '../messages/discover-features'
import { MediationRequestMessage } from '../messages/mediation'
import {
  DeliveryRequestMessage,
  LiveModeChangeMessage,
  MessagesReceivedMessage,
  StatusRequestMessage,
} from '../messages/message-pickup'
import { TrustPingMessage } from '../messages/trust-ping'
import { KeyListService } from './key-list.service'
import { DiscoverFeaturesService } from './discover-features.service'
import { MediationService } from './mediation.service'
import { MessagePickupService } from './message-pickup.service'

@Injectable()
export class RouterService {
  constructor(
    private readonly didcommService: DidcommService,
    private readonly mediationService: MediationService,
    private readonly didListService: KeyListService,
    private readonly messagePickupService: MessagePickupService,
    private readonly discoverFeaturesService: DiscoverFeaturesService,
    @InjectLogger(RouterService)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async processMessage(
    packedMsg: EncryptedMessage | SignedMessage,
  ): Promise<EncryptedMessage | SignedMessage | undefined> {
    const logger = this.logger.child('processMessage')
    logger.trace('>')

    const plainMessage = await this.didcommService.unpackMessage(packedMsg)
    logger.debug({ plainMessage }, 'Processing received message')

    const responseMsg = await this.processMessageByType(plainMessage)
    logger.traceObject({ responseMsg })

    if (!responseMsg) return

    logger.debug({ responseMsg }, 'Sending response message')

    const encryptedMsg = await this.didcommService.packMessageEncrypted(responseMsg, {
      fromDID: responseMsg.from,
      toDID: responseMsg.to![0],
    })
    logger.trace({ encryptedMsg }, '<')
    return encryptedMsg
  }

  private async processMessageByType(plainMessage: IMessage): Promise<DidcommMessage | undefined> {
    const logger = this.logger.child('processMessageByType')
    switch (plainMessage.type) {
      case MediationRequestMessage.type:
        return await this.mediationService.processMediationRequest(
          plainToInstance(MediationRequestMessage, plainMessage),
        )
      case DidcommForwardMessage.type:
        await this.mediationService.processForward(plainToInstance(DidcommForwardMessage, plainMessage))
        return
      case TrustPingMessage.type:
        return await this.mediationService.processTrustPing(plainToInstance(TrustPingMessage, plainMessage))
      case QueriesMessage.type:
        return await this.discoverFeaturesService.processDiscoverFeaturesQuery(
          plainToInstance(QueriesMessage, plainMessage),
        )
      case KeyListUpdateMessage.type:
        return await this.didListService.processDidListUpdate(plainToInstance(KeyListUpdateMessage, plainMessage))
      case KeyListQueryMessage.type:
        return await this.didListService.processDidListQuery(plainToInstance(KeyListQueryMessage, plainMessage))
      case StatusRequestMessage.type:
        return await this.messagePickupService.processStatusRequest(plainToInstance(StatusRequestMessage, plainMessage))
      case DeliveryRequestMessage.type:
        return await this.messagePickupService.processDeliveryRequest(
          plainToInstance(DeliveryRequestMessage, plainMessage),
        )
      case MessagesReceivedMessage.type:
        await this.messagePickupService.processMessagesReceived(plainToInstance(MessagesReceivedMessage, plainMessage))
        return undefined
      case LiveModeChangeMessage.type:
        await this.messagePickupService.processLiveModeChange(plainToInstance(LiveModeChangeMessage, plainMessage))
        return undefined
      default:
        logger.warn({ plainMessage }, '<')
        throw new Error(`Unsupported mediation message type: ${plainMessage.type}`)
    }
  }
}
