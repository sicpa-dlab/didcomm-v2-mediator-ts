import { IdResponse } from '@common/dto'
import { Agent } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { conflictHandler, failIfExists, notFoundHandler } from '@utils/mikro-orm'
import { CreateRequest, UpdateRequest } from './dto'

@Injectable()
export class AgentService {
  constructor(
    @InjectLogger(AgentService)
    private readonly logger: Logger,
    private readonly em: EntityManager,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async create(req: CreateRequest.Agent): Promise<IdResponse.Id> {
    const logger = this.logger.child('createAgent', { req })
    logger.trace('>')

    await failIfExists(this.em, Agent, { did: req.did }, conflictHandler(logger))

    const agent = new Agent({
      did: req.did,
      deliveryType: req.deliveryType,
      deliveryData: req.deliveryData,
    })
    logger.traceObject({ agent })

    await this.em.persistAndFlush(agent)

    const res = new IdResponse.Id(agent.id)
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
}
