import { EncryptedMessage } from '@common/didcomm/messages'
import { DidcommDidResolverService, SecretsResolverService } from '@common/didcomm/resolvers'
import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { convertToPlainJson } from '@utils/json'
import { IMessage, Message } from 'didcomm-node'

export interface PackMessageParams {
  toDID: string
  fromDID: string | null | undefined
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

  public async packMessageEncrypted(payload: IMessage, params: PackMessageParams): Promise<EncryptedMessage> {
    const logger = this.logger.child('packMessageEncrypted', { payload, params })
    logger.trace('>')

    const message = new Message(payload)

    logger.traceObject({ message })

    const [encryptedMsg] = await message.pack_encrypted(
      params.toDID,
      params.fromDID || null,
      null,
      this.didResolverService,
      this.secretsResolverService,
      {},
    )

    logger.trace('<')
    return EncryptedMessage.fromJson(encryptedMsg)
  }

  public async unpackMessage(packedMessage: EncryptedMessage): Promise<IMessage> {
    const logger = this.logger.child('unpackMessage', { packedMessage })
    logger.trace('>')

    const [unpackedMsg] = await Message.unpack(
      convertToPlainJson(packedMessage),
      this.didResolverService,
      this.secretsResolverService,
      {},
    )

    logger.trace('<')
    return unpackedMsg.as_value()
  }
}
