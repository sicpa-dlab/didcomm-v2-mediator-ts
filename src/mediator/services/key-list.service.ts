import { DidcommContext } from '@common/didcomm/providers'
import { PageInfo } from '@common/dto'
import { AgentReferenceFields } from '@common/entities/agent.entity'
import { Agent, AgentRegisteredDid } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { notFoundHandler } from '@utils/mikro-orm'
import {
  KeyListQueryMessage,
  DidListResponseItem,
  KeyListResponseMessage,
  DidListUpdate,
  DidListUpdateAction,
  DidListUpdated,
  KeyListUpdateMessage,
  KeyListUpdateResponseMessage,
  DidListUpdateResult,
} from '../messages/key-list'

@Injectable()
export class KeyListService {
  constructor(
    private readonly didcommContext: DidcommContext,
    @InjectLogger(KeyListService)
    private readonly logger: Logger,
    private readonly em: EntityManager,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async processDidListUpdate(msg: KeyListUpdateMessage): Promise<KeyListUpdateResponseMessage> {
    const logger = this.logger.child('processDidListUpdate', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(
      Agent,
      { did: msg.from },
      {
        populate: [AgentReferenceFields.RegisteredDids],
        failHandler: notFoundHandler(logger),
      },
    )
    logger.traceObject({ agent })

    const updatesResults: DidListUpdated[] = []

    for (const update of msg.body.updates) {
      const updateResult = await this.updateAgentRecipientDid(agent, update)
      updatesResults.push(updateResult)
    }

    await this.em.flush()

    const res = new KeyListUpdateResponseMessage({
      from: this.didcommContext.did,
      to: [agent.did],
      body: { updated: updatesResults },
    })
    logger.trace({ res }, '<')
    return res
  }

  public async processDidListQuery(msg: KeyListQueryMessage): Promise<KeyListResponseMessage> {
    const logger = this.logger.child('processDidListQuery', { msg })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(
      Agent,
      { did: msg.from },
      {
        populate: [AgentReferenceFields.RegisteredDids],
        failHandler: notFoundHandler(logger),
      },
    )
    logger.traceObject({ agent })

    const { offset, limit } = msg.body.paginate

    const didsCount = await agent.registeredDids.loadCount()
    const dids = await agent.registeredDids.matching({ offset, limit })
    logger.traceObject({ dids })

    const responseDids = dids.map((it) => new DidListResponseItem(it.did))
    const remaining = didsCount - responseDids.length - offset
    const pagination = new PageInfo({ offset, count: responseDids.length, remaining })

    const res = new KeyListResponseMessage({
      from: this.didcommContext.did,
      to: [agent.did],
      body: { dids: responseDids, pagination },
    })
    logger.trace({ res }, '<')
    return res
  }

  private async updateAgentRecipientDid(agent: Agent, update: DidListUpdate): Promise<DidListUpdated> {
    const logger = this.logger.child('updateAgentRecipientDid', { agent, update })
    logger.trace('>')

    const { action, recipientDid } = update

    const updateResult = new DidListUpdated({ ...update, result: DidListUpdateResult.NoChange })

    try {
      if (action === DidListUpdateAction.Add) {
        await this.clearExistingDidRegistrations(recipientDid)
        agent.registeredDids.add(new AgentRegisteredDid({ did: recipientDid, agent }))
        updateResult.result = DidListUpdateResult.Success
      } else if (action === DidListUpdateAction.Remove) {
        const foundDid = agent.registeredDids.getItems().find((it) => it.did === recipientDid)
        if (foundDid) {
          agent.registeredDids.remove(foundDid)
          updateResult.result = DidListUpdateResult.Success
        }
      }
    } catch (error: any) {
      logger.error({ error }, 'Did List update failed')
      updateResult.result = DidListUpdateResult.ServerError
    }

    logger.trace({ updateResult }, '<')
    return updateResult
  }

  private async clearExistingDidRegistrations(did: string): Promise<void> {
    const logger = this.logger.child('clearExistingDidRegistrations', { did })
    logger.trace('>')

    const existingRegistrations = await this.em.find(AgentRegisteredDid, { did })

    if (existingRegistrations.length) {
      logger.warn({ existingRegistrations }, 'Clearing existing Agent DID registrations')
    }

    existingRegistrations.forEach((registeredDid) => this.em.remove(registeredDid))

    logger.trace('<')
  }
}
