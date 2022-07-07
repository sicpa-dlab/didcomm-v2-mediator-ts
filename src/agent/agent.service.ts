import { IdResponse } from '@common/dto'
import { failIfExists, internalServerErrorHandler, notFoundHandler } from '@common/utils/mikro-orm'
import { Agent } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { CreateRequest, GetResponse, UpdateRequest } from './dto'

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
    const logger = this.logger.child('create', { req })
    logger.trace('>')

    await failIfExists(this.em, Agent, { did: req.did }, internalServerErrorHandler(logger))

    const agent = new Agent({
      ...req,
      didDoc: {},
    })

    logger.traceObject({ agent })

    await this.em.persistAndFlush(agent)

    const res = new IdResponse.Id(agent.id)
    logger.trace({ res }, '<')
    return res
  }

  public async get(id: string): Promise<GetResponse.Agent> {
    const logger = this.logger.child('get', { id })
    logger.trace('>')

    const agent = await this.em.findOneOrFail(Agent, id, {
      failHandler: notFoundHandler(logger),
    })

    logger.traceObject({ agent })

    const res = new GetResponse.Agent(agent)
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
