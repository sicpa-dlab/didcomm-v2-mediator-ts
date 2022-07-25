import { DidcommForwardMessage } from '@common/didcomm'
import { AgentRegisteredDidReferenceFields } from '@common/entities/agent-registered-did.entity'
import DidcommConfig from '@config/didcomm'
import { Agent, AgentMessage, AgentRegisteredDid } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { Injectable } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { throwError } from '@utils/common'
import { AgentService } from '../../agent'
import { MediationDenyMessage, MediationGrantMessage, MediationRequestMessage } from '../messages/mediation'

@Injectable()
export class MediationService {
  private readonly didcommConfig: ConfigType<typeof DidcommConfig>

  constructor(
    private readonly agentsService: AgentService,
    private readonly em: EntityManager,
    @InjectLogger(MediationService)
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    const _logger = this.logger.child('constructor')
    _logger.trace('<')

    this.didcommConfig =
      configService.get<ConfigType<typeof DidcommConfig>>('didcomm') ?? throwError('Didcomm config is not defined')

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
        from: this.didcommConfig.mediatorDid,
        to: [msg.from],
        body: {
          routingKeys: [this.didcommConfig.mediatorDid],
          endpoint: 'http://localhost:3000/api/v1', // FIXME: GET Actual address
        },
      })
    } catch (e: any) {
      logger.error({ res }, 'Error')
      res = new MediationDenyMessage({
        from: this.didcommConfig.mediatorDid,
        to: [msg.from],
      })
    }

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

    for (const attachment of msg.attachments) {
      agent.messages.add(new AgentMessage({ agent, payload: attachment }))
    }

    await this.em.flush()

    logger.trace('<')
  }
}
