import { DidcommService } from '@common/didcomm'
import { EncryptedMessage } from '@common/didcomm/messages'
import { DidcommContext } from '@common/didcomm/providers'
import { Agent, AgentMessage } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager, QueryOrder } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import {
  DeliveryMessage,
  DeliveryRequestMessage,
  MessagesReceivedMessage,
  StatusRequestMessage,
  StatusResponseMessage,
} from '../messages/message-pickup'

@Injectable()
export class MessagePickupService {
  constructor(
    private readonly didcommContext: DidcommContext,
    private readonly didcommService: DidcommService,
    @InjectLogger(MessagePickupService)
    private readonly logger: Logger,
    private readonly em: EntityManager,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async processStatusRequest(msg: StatusRequestMessage): Promise<StatusResponseMessage> {
    const logger = this.logger.child('processStatusRequest', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, { did: msg.from })
    logger.traceObject({ agent })

    const messageCount = msg.body.recipientKey
      ? await this.em.count(AgentMessage, { recipient: msg.body.recipientKey })
      : await agent.messages.loadCount()

    logger.info(`Sending status response for agent DID ${agent.did}: ${messageCount} undelivered messages`)

    const res = new StatusResponseMessage({
      from: this.didcommContext.did,
      to: [agent.did],
      body: { messageCount },
    })
    logger.trace({ res }, '<')
    return res
  }

  public async processDeliveryRequest(msg: DeliveryRequestMessage): Promise<DeliveryMessage> {
    const logger = this.logger.child('processDeliveryRequest', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, { did: msg.from })
    logger.traceObject({ agent })

    const { deliveryMessage, messages } = await this.getMessage(agent, msg.body.limit, 0, msg.body.recipientKey)

    logger.trace({ deliveryMessage })

    messages.forEach((it) => this.em.remove(it))

    await this.em.flush()

    logger.trace('<')
    return deliveryMessage
  }

  public async processMessagesReceived(msg: MessagesReceivedMessage): Promise<undefined> {
    const logger = this.logger.child('processListPickup', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, { did: msg.from })
    logger.traceObject({ agent })

    const messages = await agent.messages.matching({ where: { id: msg.body.messageIdList } })
    logger.trace({ messages })

    messages.forEach((it) => this.em.remove(it))

    await this.em.flush()

    logger.trace('<')
    return undefined
  }

  public async getUndeliveredBatchMessage(
    agent: Agent,
    batchSize: number,
    offset: number,
  ): Promise<Promise<{ encryptedMsg: EncryptedMessage; messages: AgentMessage[] }>> {
    const logger = this.logger.child('processUndeliveredMessages', { agent })
    logger.trace('>')

    const { deliveryMessage, messages } = await this.getMessage(agent, batchSize, offset)

    const encryptedMsg = await this.didcommService.packMessageEncrypted(deliveryMessage, {
      fromDID: deliveryMessage.from,
      toDID: deliveryMessage.to![0],
    })
    logger.trace({ encryptedMsg }, '<')
    return { encryptedMsg, messages }
  }

  private async getMessage(
    agent: Agent,
    limit: number,
    offset: number = 0,
    recipientKey?: string,
  ): Promise<{ deliveryMessage: DeliveryMessage; messages: AgentMessage[] }> {
    const logger = this.logger.child('getMessage')
    logger.trace('>')

    const options = {
      limit,
      offset,
      orderBy: { createdAt: QueryOrder.ASC },
    }

    const messages = recipientKey
      ? await this.em.find(AgentMessage, { recipient: recipientKey }, options)
      : await agent.messages.matching(options)

    logger.trace({ messages })

    const deliveryMessage = new DeliveryMessage({
      from: this.didcommContext.did,
      to: [agent.did],
      body: {
        recipientKey,
      },
      attachments: messages.map((it) => it.payload),
    })
    logger.trace({ res: deliveryMessage }, '<')
    return { deliveryMessage, messages }
  }
}
