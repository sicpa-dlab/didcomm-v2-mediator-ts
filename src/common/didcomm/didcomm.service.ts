import { DidcommDidResolverService, SecretsResolverService } from '@common/didcomm/resolvers'
import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { IMessage, Message } from 'didcomm-node'

export interface PackMessageParams {
  toDID: string
  fromDID: string | null | undefined
  signByDID: string | null | undefined
}

export interface PackMessageSignedParams {
  signByDID: string
}

@Injectable()
export class DidcommService {
  constructor(
    private readonly didResolverService: DidcommDidResolverService,
    private readonly secretsResolverService: SecretsResolverService,
    @InjectLogger(DidcommService)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async packMessageEncrypted(payload: IMessage, params: PackMessageParams): Promise<string> {
    const logger = this.logger.child('create', { payload, params })
    logger.trace('>')

    const message = new Message(payload)

    logger.traceObject({ message })

    const [encryptedMsg] = await message.pack_encrypted(
      params.toDID,
      params.fromDID || null,
      params.signByDID || null,
      this.didResolverService,
      this.secretsResolverService,
      {},
    )
    return encryptedMsg
  }

  public async packMessageSigned(payload: any, params: PackMessageSignedParams): Promise<string> {
    const message = new Message(payload)

    const [encryptedMsg] = await message.pack_signed(
      params.signByDID,
      this.didResolverService,
      this.secretsResolverService,
    )
    return encryptedMsg
  }

  public async unpackMessage(packedMessage: string): Promise<Message> {
    const [unpackedMsg] = await Message.unpack(packedMessage, this.didResolverService, this.secretsResolverService, {})
    return unpackedMsg
  }
}
