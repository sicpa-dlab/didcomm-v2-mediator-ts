import { DidcommService, DidResolverService } from '@common/didcomm'
import { IdResponse, MessageResponse } from '@common/dto'
import { failIfExists, internalServerErrorHandler, notFoundHandler } from '@common/utils/mikro-orm'
import DidcommConfig from '@config/didcomm'
import { Agent, AgentKeysMapping } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { getKidsFromDidDoc } from '@utils/didcomm'
import { CreateRequest, UpdateRequest } from './dto'
import { AgentDetailsMessage } from './messages/agent-details.message'

@Injectable()
export class AgentService {
  private readonly didcommConfig: ConfigType<typeof DidcommConfig>

  constructor(
    private readonly didResolverService: DidResolverService,
    private readonly didcommService: DidcommService,
    @InjectLogger(AgentService)
    private readonly logger: Logger,
    private readonly em: EntityManager,
    configService: ConfigService,
  ) {
    const _logger = this.logger.child('constructor')
    _logger.trace('<')

    const didcommConfig = configService.get<ConfigType<typeof DidcommConfig>>('didcomm')

    if (!didcommConfig) throw new Error('Didcomm config is not defined')
    _logger.traceObject(didcommConfig)

    this.didcommConfig = didcommConfig
    _logger.trace('<')
  }

  public async create(req: CreateRequest.Agent): Promise<IdResponse.Id> {
    const logger = this.logger.child('create', { req })
    logger.trace('>')

    await failIfExists(this.em, Agent, { did: req.did }, internalServerErrorHandler(logger))

    const didDoc = await this.didResolverService.resolve(req.did)
    if (!didDoc) throw new Error('Cannot parse DIDDoc for specified DID!')

    const agent = new Agent({
      ...req,
      didDoc,
    })

    const agentKids = getKidsFromDidDoc(didDoc)
    for (const kid of agentKids) {
      agent.keysMappings.add(new AgentKeysMapping({ kid, agent }))
    }

    logger.traceObject({ agent })

    await this.em.persistAndFlush(agent)

    const res = new IdResponse.Id(agent.id)
    logger.trace({ res }, '<')
    return res
  }

  public async get(id: string): Promise<MessageResponse.Message> {
    const logger = this.logger.child('get', { id })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, id, {
      failHandler: notFoundHandler(logger),
    })

    logger.traceObject({ agent })

    const payload = new AgentDetailsMessage({
      attachments: [
        AgentDetailsMessage.createJSONAttachment('agent-details', {
          deliveryType: agent.deliveryType,
          deliveryData: agent.deliveryData,
        }),
      ],
    })

    const encryptedMessage = await this.didcommService.packMessageEncrypted(payload, {
      fromDID: this.didcommConfig.mediatorDid,
      toDID: agent.did,
      signByDID: null,
    })

    const res = new MessageResponse.Message(encryptedMessage)
    logger.trace({ res }, '<')
    return res
  }

  public async update(id: string, req: UpdateRequest.Agent): Promise<void> {
    const logger = this.logger.child('update', { id, req })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, id, { failHandler: notFoundHandler(logger) })

    logger.traceObject({ agent })

    agent.deliveryType = req.deliveryType
    agent.deliveryData = req.deliveryData

    await this.em.flush()

    logger.trace('<')
  }

  public async delete(id: string): Promise<void> {
    const logger = this.logger.child('delete', { id })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, id, { failHandler: notFoundHandler(logger) })

    logger.traceObject({ agent })

    await this.em.removeAndFlush(agent)

    logger.trace('<')
  }
}
