import { DidcommContext } from '@common/didcomm/providers'
import { Agent } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager, QueryOrder } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import {
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

  public async processBatchPickup(msg: BatchPickupMessage): Promise<BatchResponseMessage> {
    const logger = this.logger.child('processBatchPickup', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, { did: msg.from })
    logger.traceObject({ agent })

    const messages = await agent.messages.matching({
      limit: msg.body.batchSize,
      orderBy: { createdAt: QueryOrder.ASC },
    })
    logger.trace({ messages })

    const res = new BatchResponseMessage({
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
}
