import { DidcommForwardMessage, DidcommService } from '@common/didcomm'
import { AgentRegisteredDidReferenceFields } from '@common/entities/agent-registered-did.entity'
import { AgentDeliveryType } from '@common/entities/agent.entity'
import DidcommConfig from '@config/didcomm'
import ExpressConfig from '@config/express'
import { Agent, AgentMessage, AgentRegisteredDid } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager } from '@mikro-orm/core'
import { HttpService } from '@nestjs/axios'
import { Injectable, NotImplementedException } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { throwError } from '@utils/common'
import { v4 as generateId } from 'uuid'
import { AgentService } from '../../agent'
import { MediationDenyMessage, MediationGrantMessage, MediationRequestMessage } from '../messages/mediation'
import { BatchResponseMessage, MessageAttachment, MessagesResponse } from '../messages/message-pickup'

@Injectable()
export class MediationService {
  private readonly didcommConfig: ConfigType<typeof DidcommConfig>
  private readonly expressConfig: ConfigType<typeof ExpressConfig>

  constructor(
    private readonly agentsService: AgentService,
    private readonly didcommService: DidcommService,
    private readonly httpService: HttpService,
    private readonly em: EntityManager,
    @InjectLogger(MediationService)
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    const _logger = this.logger.child('constructor')
    _logger.trace('<')

    this.didcommConfig =
      configService.get<ConfigType<typeof DidcommConfig>>('didcomm') ?? throwError('Didcomm config is not defined')
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
        from: this.didcommConfig.mediatorDid,
        to: [msg.from],
        body: {
          routingKeys: [this.didcommConfig.mediatorDid],
          endpoint: `${this.expressConfig.publicUrl}/api/v1`,
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

    const isDeliveryMethodSpecified = !!agent.deliveryType && !!agent.deliveryData

    // If delivery method is specified, mediator will deliver message
    if (isDeliveryMethodSpecified) {
      await this.deliverForward(agent, msg)
    }

    // Store messages so recipient can fetch them later using message-pickup API (applies to push token delivery method)
    if (!isDeliveryMethodSpecified || agent.deliveryType === AgentDeliveryType.Push) {
      for (const attachment of msg.attachments) {
        agent.messages.add(new AgentMessage({ agent, payload: attachment }))
      }
      await this.em.flush()
    }

    logger.trace('<')
  }

  private async deliverForward(agent: Agent, msg: DidcommForwardMessage): Promise<void> {
    const { deliveryType, deliveryData } = agent
    if (!deliveryType || !deliveryData)
      throw new Error('Agent delivery method is not specified or web hook/token is missing')

    if (deliveryType === AgentDeliveryType.WebHook) {
      const deliveryMsg = new BatchResponseMessage({
        from: this.didcommConfig.mediatorDid,
        to: [agent.did],
        body: new MessagesResponse({
          messages: msg.attachments.map((it) => new MessageAttachment({ id: it.id || generateId(), message: it })),
        }),
      })

      const encryptedMsg = await this.didcommService.packMessageEncrypted(deliveryMsg, {
        fromDID: deliveryMsg.from,
        toDID: deliveryMsg.to![0],
      })

      await this.httpService.axiosRef.post(deliveryData, encryptedMsg, {
        headers: {
          'Content-Type': this.didcommConfig.mimeType,
          Origin: this.expressConfig.publicUrl,
        },
      })
    } else if (deliveryType === AgentDeliveryType.Push) {
      throw new NotImplementedException('Push token delivery method is not supported yet')
    }
  }
}
