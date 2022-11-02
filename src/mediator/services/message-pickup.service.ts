import { DidcommService } from '@common/didcomm'
import { EncryptedMessage } from '@common/didcomm/messages'
import { DidcommContext } from '@common/didcomm/providers'
import { Agent, AgentMessage } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager, QueryOrder } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import {
  BatchAckMessage,
  BatchPickupMessage,
  BatchResponseMessage,
  ListPickupMessage,
  ListResponseMessage,
  MessageAttachment,
  MessagesResponse,
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

    const messageCount = await agent.messages.loadCount()

    const res = new StatusResponseMessage({
      from: this.didcommContext.did,
      to: [agent.did],
      body: { messageCount },
    })
    logger.trace({ res }, '<')
    return res
  }

  public async processBatchAck(msg: BatchAckMessage) {
    const logger = this.logger.child('processBatchAck', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, { did: msg.from })
    logger.trace({ agent })

    const ackIds = msg.ack

    const messages: AgentMessage[] = (await agent.messages.loadItems()).filter(
      (m) => m.payload.id && ackIds.includes(m.payload.id),
    )
    const messageIds = messages.map((m) => m.payload.id)
    logger.info({ messageIds: `Processed messages ids: ${messageIds}` })

    messages.forEach((it) => this.em.remove(it))

    await this.em.flush()

    logger.trace('<')
  }

  public async processBatchPickup(msg: BatchPickupMessage): Promise<BatchResponseMessage> {
    const logger = this.logger.child('processBatchPickup', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, { did: msg.from })
    logger.traceObject({ agent })

    const { responseMsg } = await this.getBatchResponseMessage(agent, msg.body.batchSize)

    logger.trace('<')
    return responseMsg
  }

  public async getBatchResponseMessage(agent: Agent, batchSize: number, offset: number = 0) {
    const logger = this.logger.child('getBatchResponseMessage')
    logger.trace('>')
    const messages: AgentMessage[] = await agent.messages.matching({
      limit: batchSize,
      orderBy: { createdAt: QueryOrder.ASC },
      offset,
    })
    logger.trace({ messages })

    const responseMsg = new BatchResponseMessage({
      from: this.didcommContext.did,
      to: [agent.did],
      body: new MessagesResponse({
        messages: messages.map((it) => new MessageAttachment({ id: it.id, message: it.payload })),
      }),
    })
    logger.trace({ responseMsg })
    logger.trace('<')
    return { messages, responseMsg }
  }

  public async processListPickup(msg: ListPickupMessage): Promise<ListResponseMessage> {
    const logger = this.logger.child('processListPickup', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, { did: msg.from })
    logger.traceObject({ agent })

    const messages = await agent.messages.matching({ where: { id: msg.body.messageIds } })
    logger.trace({ messages })

    const res = new ListResponseMessage({
      from: this.didcommContext.did,
      to: [agent.did],
      body: new MessagesResponse({
        messages: messages.map((it) => new MessageAttachment({ id: it.id, message: it.payload })),
      }),
    })
    logger.trace({ res })

    messages.forEach((it) => this.em.remove(it))

    await this.em.flush()

    logger.trace('<')
    return res
  }

  public async getUndeliveredBatchMessage(
    agent: Agent,
    batchSize: number,
    offset: number,
  ): Promise<{ encryptedMsg: EncryptedMessage; messages: AgentMessage[] }> {
    const logger = this.logger.child('processUndeliveredMessages', { agent })

    const { responseMsg, messages } = await this.getBatchResponseMessage(agent, batchSize, offset)

    const encryptedMsg = await this.didcommService.packMessageEncrypted(responseMsg, {
      fromDID: responseMsg.from,
      toDID: responseMsg.to![0],
    })
    logger.trace({ encryptedMsg }, '<')
    return { encryptedMsg, messages }
  }
}
