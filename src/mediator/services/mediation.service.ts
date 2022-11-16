import { DidcommForwardMessage } from '@common/didcomm'
import { DidcommContext } from '@common/didcomm/providers'
import { AgentRegisteredDidReferenceFields } from '@common/entities/agent-registered-did.entity'
import { Agent, AgentMessage, AgentRegisteredDid } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { AgentService } from '../../agent'
import { MediationDenyMessage, MediationGrantMessage, MediationRequestMessage } from '../messages/mediation'
import { TrustPingMessage, TrustPingResponseMessage } from '../messages/trust-ping'
import { DeliveryService } from './delivery.service'

@Injectable()
export class MediationService {
  constructor(
    private readonly agentsService: AgentService,
    private readonly deliveryService: DeliveryService,
    private readonly didcommContext: DidcommContext,
    private readonly em: EntityManager,
    @InjectLogger(MediationService)
    private readonly logger: Logger,
  ) {}

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
          routingDid: [this.didcommContext.did],
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
      thid: msg.id,
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
      agent.messages.add(new AgentMessage({ agent, payload: attachment, recipient: next }))
    }
    await this.em.flush()

    // Try to deliver message
    if (agent?.liveDelivery && agent.deliveryType && agent.deliveryData) {
      await this.deliveryService.tryDeliverForward(agent, msg)
    }

    logger.trace('<')
  }
}
