import { DidcommForwardMessage } from '@common/didcomm'
import { DidcommContext } from '@common/didcomm/providers'
import { AgentRegisteredDidReferenceFields } from '@common/entities/agent-registered-did.entity'
import ExpressConfig from '@config/express'
import { Agent, AgentMessage, AgentRegisteredDid } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { throwError } from '@utils/common'
import { v4 as generateId } from 'uuid'
import { AgentService } from '../../agent'
import { MediationDenyMessage, MediationGrantMessage, MediationRequestMessage } from '../messages/mediation'
import { TrustPingMessage, TrustPingResponseMessage } from '../messages/trust-ping'
import { DeliveryService } from './delivery.service'

@Injectable()
export class MediationService {
  private readonly expressConfig: ConfigType<typeof ExpressConfig>

  constructor(
    private readonly agentsService: AgentService,
    private readonly deliveryService: DeliveryService,
    private readonly didcommContext: DidcommContext,
    private readonly em: EntityManager,
    @InjectLogger(MediationService)
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    const _logger = this.logger.child('constructor')
    _logger.trace('>')

    this.expressConfig =
      configService.get<ConfigType<typeof ExpressConfig>>('express') ?? throwError('Express config is not defined')

    _logger.trace('<')
  }

  public async processMediationRequest(
    msg: MediationRequestMessage,
  ): Promise<MediationGrantMessage | MediationDenyMessage> {
    const logger = this.logger.child('processMediationRequest', { msg })
    logger.trace('>')

    let res: MediationGrantMessage | MediationDenyMessage | undefined

    try {
      await this.agentsService.create({ did: msg.from, ...msg.body })

      res = new MediationGrantMessage({
        from: this.didcommContext.did,
        to: [msg.from],
        body: {
          routingKeys: [this.didcommContext.did],
          endpoint: `${this.expressConfig.publicUrl}/api/v1`,
        },
      })
    } catch (error: any) {
      logger.error({ error }, 'Mediation grant failed')
      res = new MediationDenyMessage({
        from: this.didcommContext.did,
        to: [msg.from],
      })
    }

    logger.trace({ res }, '<')
    return res
  }

  public async processTrustPing(msg: TrustPingMessage): Promise<TrustPingResponseMessage | undefined> {
    const logger = this.logger.child('processTrustPing', { msg })
    logger.trace('>')

    if (!msg.body.responseRequested) return

    const res = new TrustPingResponseMessage({
      from: this.didcommContext.did,
      to: [msg.from],
      thid: generateId(),
    })

    logger.trace({ res }, '<')
    return res
  }

  public async processForward(msg: DidcommForwardMessage): Promise<void> {
    const logger = this.logger.child('processForward', { msg })
    logger.trace('>')

    const { next } = msg.body

    let agent: Agent | undefined

    //  look up over mappings
    const registeredDid = await this.em.findOne(
      AgentRegisteredDid,
      { did: next },
      {
        populate: [AgentRegisteredDidReferenceFields.Agent],
      },
    )

    // if we did not find mapping -> look up over agents directly
    agent = registeredDid?.agent ?? (await this.em.findOneOrFail(Agent, { did: next }))
    logger.traceObject({ agent })

    // Store messages so recipient can fetch them later using message-pickup API
    // Sent messages will be removed with BatchAck message
    for (const attachment of msg.attachments) {
      if (!attachment.id) {
        attachment.id = generateId()
      }
      agent.messages.add(new AgentMessage({ agent, payload: attachment }))
    }
    await this.em.flush()

    // Try to deliver message
    await this.deliveryService.tryDeliverForward(agent, msg)

    logger.trace('<')
  }
}
