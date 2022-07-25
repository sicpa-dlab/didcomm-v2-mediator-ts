import { PageInfo } from '@common/dto'
import { AgentReferenceFields } from '@common/entities/agent.entity'
import DidcommConfig from '@config/didcomm'
import { Agent, AgentRegisteredDid } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { throwError } from '@utils/common'
import { notFoundHandler } from '@utils/mikro-orm'
import {
  DidListQueryMessage,
  DidListResponseItem,
  DidListResponseMessage,
  DidListUpdate,
  DidListUpdateAction,
  DidListUpdated,
  DidListUpdateMessage,
  DidListUpdateResponseMessage,
  DidListUpdateResult,
} from '../messages/did-list'

@Injectable()
export class DidListService {
  private readonly didcommConfig: ConfigType<typeof DidcommConfig>

  constructor(
    @InjectLogger(DidListService)
    private readonly logger: Logger,
    private readonly em: EntityManager,
    configService: ConfigService,
  ) {
    const _logger = this.logger.child('constructor')
    _logger.trace('<')

    this.didcommConfig =
      configService.get<ConfigType<typeof DidcommConfig>>('didcomm') ?? throwError('Didcomm config is not defined')

    _logger.trace('<')
  }

  public async processDidListUpdate(msg: DidListUpdateMessage): Promise<DidListUpdateResponseMessage> {
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
      const updateResult = this.updateAgentRecipientDid(agent, update)
      updatesResults.push(updateResult)
    }

    await this.em.flush()

    const res = new DidListUpdateResponseMessage({
      from: this.didcommConfig.mediatorDid,
      to: [agent.did],
      body: { updated: updatesResults },
    })
    logger.trace({ res }, '<')
    return res
  }

  public async processDidListQuery(msg: DidListQueryMessage): Promise<DidListResponseMessage> {
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

    const res = new DidListResponseMessage({
      from: this.didcommConfig.mediatorDid,
      to: [agent.did],
      body: { dids: responseDids, pagination },
    })
    logger.trace({ res }, '<')
    return res
  }

  private updateAgentRecipientDid(agent: Agent, update: DidListUpdate): DidListUpdated {
    const logger = this.logger.child('updateAgentRecipientDid', { agent, update })
    logger.trace('>')

    const { action, recipientDid } = update

    const updateResult = new DidListUpdated({ ...update, result: DidListUpdateResult.NoChange })

    try {
      if (action === DidListUpdateAction.Add) {
        agent.registeredDids.add(new AgentRegisteredDid({ did: recipientDid, agent }))
        updateResult.result = DidListUpdateResult.Success
      } else if (action === DidListUpdateAction.Remove) {
        const foundDid = agent.registeredDids.getItems().find((it) => it.did === recipientDid)
        if (foundDid) {
          agent.registeredDids.remove(foundDid)
          updateResult.result = DidListUpdateResult.Success
        }
      }
    } catch (e: any) {
      logger.error(e)
      updateResult.result = DidListUpdateResult.ServerError
    }

    logger.trace({ updateResult }, '<')
    return updateResult
  }
}
