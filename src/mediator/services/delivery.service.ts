import { DidcommForwardMessage, DidcommService } from '@common/didcomm'
import { EncryptedMessage } from '@common/didcomm/messages'
import { DidcommContext } from '@common/didcomm/providers'
import { AgentDeliveryType } from '@common/entities/agent.entity'
import DidcommConfig from '@config/didcomm'
import ExpressConfig from '@config/express'
import { Agent } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { HttpService } from '@nestjs/axios'
import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { throwError } from '@utils/common'
import { v4 as generateId } from 'uuid'
import { MediatorGateway } from '../mediator.gateway'
import { BatchResponseMessage, MessageAttachment, MessagesResponse } from '../messages/message-pickup'

@Injectable()
export class DeliveryService {
  private readonly didcommConfig: ConfigType<typeof DidcommConfig>
  private readonly expressConfig: ConfigType<typeof ExpressConfig>

  constructor(
    private readonly didcommService: DidcommService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => MediatorGateway))
    private readonly websocketGateway: MediatorGateway,
    private readonly didcommContext: DidcommContext,
    @InjectLogger(DeliveryService)
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    const _logger = this.logger.child('constructor')
    _logger.trace('>')

    this.didcommConfig =
      configService.get<ConfigType<typeof DidcommConfig>>('didcomm') ?? throwError('Didcomm config is not defined')
    this.expressConfig =
      configService.get<ConfigType<typeof ExpressConfig>>('express') ?? throwError('Express config is not defined')

    _logger.trace('<')
  }

  public async tryDeliverForward(agent: Agent, msg: DidcommForwardMessage): Promise<boolean> {
    const logger = this.logger.child('tryDeliverForward', { agent, msg })

    const { deliveryType } = agent

    if (!deliveryType) {
      logger.error('Agent delivery method is not specified')
      return false
    }

    if (deliveryType === AgentDeliveryType.Push) {
      logger.error('Push token delivery method is not supported yet')
      return false
    }

    const deliveryMsg = new BatchResponseMessage({
      from: this.didcommContext.did,
      to: [agent.did],
      body: new MessagesResponse({
        messages: msg.attachments.map((it) => new MessageAttachment({ id: it.id || generateId(), message: it })),
      }),
    })

    const encryptedMsg = await this.didcommService.packMessageEncrypted(deliveryMsg, {
      fromDID: deliveryMsg.from,
      toDID: deliveryMsg.to![0],
    })

    try {
      await this.deliverMessage(agent, encryptedMsg)
    } catch (e: any) {
      logger.error(e)
      return false
    }

    return true
  }

  private async deliverMessage(agent: Agent, msg: EncryptedMessage) {
    const { deliveryType, deliveryData } = agent

    if (deliveryType === AgentDeliveryType.WebHook) {
      const webHook = deliveryData ?? throwError('Agent web hook is missing, but required for WebHook delivery method')
      await this.httpService.axiosRef.post(webHook, msg, {
        headers: {
          'Content-Type': this.didcommConfig.mimeType,
          Origin: this.expressConfig.publicUrl,
        },
      })
    } else if (deliveryType === AgentDeliveryType.WebSocket) {
      this.websocketGateway.sendMessage(agent.did, msg)
    } else {
      throw new Error('Unsupported delivery method')
    }
  }
}
