import { DidcommForwardMessage, DidcommMessage, DidcommService } from '@common/didcomm'
import { EncryptedMessage } from '@common/didcomm/messages'
import { SignedMessage } from '@common/didcomm/messages/signed.message'
import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { IMessage } from 'didcomm-node'
import { DidListQueryMessage, DidListUpdateMessage } from '../messages/did-list'
import { MediationRequestMessage } from '../messages/mediation'
import {
  BatchAckMessage,
  BatchPickupMessage,
  ListPickupMessage,
  StatusRequestMessage,
} from '../messages/message-pickup'
import { TrustPingMessage } from '../messages/trust-ping'
import { DidListService } from './did-list.service'
import { MediationService } from './mediation.service'
import { MessagePickupService } from './message-pickup.service'

@Injectable()
export class RouterService {
  constructor(
    private readonly didcommService: DidcommService,
    private readonly mediationService: MediationService,
    private readonly didListService: DidListService,
    private readonly messagePickupService: MessagePickupService,
    @InjectLogger(RouterService)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async processMessage(
    packedMsg: EncryptedMessage | SignedMessage,
  ): Promise<EncryptedMessage | SignedMessage | undefined> {
    const logger = this.logger.child('processMessage', { packedMsg })
    logger.trace('>')

    const plainMessage = await this.didcommService.unpackMessage(packedMsg)
    logger.traceObject({ plainMessage })

    const responseMsg = await this.processUnpackedMessageByType(plainMessage)
    logger.traceObject({ responseMsg })
    if (!responseMsg) return

    const encryptedMsg = await this.didcommService.packMessageEncrypted(responseMsg, {
      fromDID: responseMsg.from,
      toDID: responseMsg.to![0],
    })
    logger.trace({ encryptedMsg }, '<')
    return encryptedMsg
  }

  private async processUnpackedMessageByType(plainMessage: IMessage): Promise<DidcommMessage | undefined> {
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
      case DidListUpdateMessage.type:
        return await this.didListService.processDidListUpdate(plainToInstance(DidListUpdateMessage, plainMessage))
      case DidListQueryMessage.type:
        return await this.didListService.processDidListQuery(plainToInstance(DidListQueryMessage, plainMessage))
      case StatusRequestMessage.type:
        return await this.messagePickupService.processStatusRequest(plainToInstance(StatusRequestMessage, plainMessage))
      case BatchPickupMessage.type:
        return await this.messagePickupService.processBatchPickup(plainToInstance(BatchPickupMessage, plainMessage))
      case ListPickupMessage.type:
        return await this.messagePickupService.processListPickup(plainToInstance(ListPickupMessage, plainMessage))
      case BatchAckMessage.type:
        await this.messagePickupService.processBatchAck(plainToInstance(BatchAckMessage, plainMessage))
        return
      default:
        throw new Error('Unsupported mediation message type')
    }
  }
}
