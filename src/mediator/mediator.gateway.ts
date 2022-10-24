import { EncryptedMessage } from '@common/didcomm/messages'
import { SignedMessage } from '@common/didcomm/messages/signed.message'
import { Agent } from '@entities'
import { InjectLogger, Logger } from '@logger'
import { EntityManager, MikroORM, UseRequestContext } from '@mikro-orm/core'
import { forwardRef, Inject } from '@nestjs/common'
import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { throwError } from '@utils/common'
import { IncomingMessage } from 'http'
import WebSocket from 'ws'
import { MessagePickupService } from './services/message-pickup.service'
import { RouterService } from './services/router.service'

@WebSocketGateway({ path: '/api/v1' })
export class MediatorGateway implements OnGatewayConnection {
  private connectedSockets: Map<string, WebSocket> = new Map<string, WebSocket>()

  public constructor(
    @Inject(forwardRef(() => RouterService))
    private readonly routerService: RouterService,
    private readonly messagePickupService: MessagePickupService,
    // We need to inject MikroORM instance to make 'UseRequestContext' decorators to work
    // @ts-ignore - ignore unused declaration
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
    @InjectLogger(MediatorGateway)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  // 'UseRequestContext' decorators are required to supply MikroORM context to WS message handlers
  // The problem is that NestJS middleware is not working for WS handlers, so MikroOrmMiddleware does not work here
  // Related link: https://stackoverflow.com/a/72799993
  @UseRequestContext()
  public async handleConnection(socket: WebSocket, request: IncomingMessage): Promise<void> {
    const logger = this.logger.child('handleConnection', { socket, request })
    logger.trace('>')

    const agentDid = request.headers['agent-did'] as string | undefined
    const agent = agentDid ? await this.em.findOne(Agent, { did: agentDid }) : null
    logger.traceObject({ agentDid, agent })

    if (!agent) {
      socket.close(3000, 'Unauthorized')
      return
    }

    logger.debug(`Connecting WebSocket for agent DID: ${agentDid}`)

    this.connectedSockets.set(agent.did, socket)
    socket.onclose = () => {
      logger.debug(`Closing WebSocket for agent DID: ${agentDid}`)
      this.connectedSockets.delete(agent.did)
    }

    try {
      await this.pushUndeliveredMessages(agent, socket)
    } catch (error) {
      logger.error('Push Undelivered Messages Failed', { error })
    }
    logger.trace('<')
  }

  @UseRequestContext()
  @SubscribeMessage('message')
  public async handleMessage(
    @MessageBody() msg: EncryptedMessage | SignedMessage,
  ): Promise<EncryptedMessage | SignedMessage | void> {
    const logger = this.logger.child('handleMessage', { msg })
    logger.trace('>')

    const responseMsg = await this.routerService.processMessage(msg)

    if (responseMsg) {
      logger.trace({ responseMsg }, '<')
      return responseMsg
    }

    logger.trace('<')
  }

  public sendMessage(agentDid: string, msg: EncryptedMessage) {
    const logger = this.logger.child('sendMessage', { agentDid, msg })
    logger.trace('>')

    const recipientSocket = this.connectedSockets.get(agentDid) ?? throwError('Recipient socket is not connected')
    logger.traceObject({ recipientSocket })

    recipientSocket.send(msg)
    logger.trace('<')
  }

  private async pushUndeliveredMessages(agent: Agent, socket: WebSocket) {
    const logger = this.logger.child('pushUndeliveredMessages', { agent })
    logger.trace('>')

    let responseMessage
    try {
      do {
        responseMessage = await this.messagePickupService.getUndeliveredBatchMessage(agent)
        logger.debug(`Sending undelivered messages: ${responseMessage.messages}`)

        socket.send(responseMessage.encryptedMsg)
        logger.traceObject({ message: responseMessage.encryptedMsg })

        responseMessage.messages.forEach((it) => this.em.remove(it))

        await this.em.flush()
      } while (responseMessage.messages.length)
    } catch (error) {
      logger.error('Error on sending undelivered messages via WebSocket', { error })
    }

    logger.trace('<')
  }
}
