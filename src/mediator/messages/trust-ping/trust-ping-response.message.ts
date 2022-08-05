import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Equals } from 'class-validator'

export class TrustPingResponseMessage extends DidcommMessage {
  @Equals(TrustPingResponseMessage.type)
  public readonly type = TrustPingResponseMessage.type
  public static readonly type = 'https://didcomm.org/trust-ping/2.0/ping-response'

  public constructor(params: DidcommMessageParams) {
    super(params)
  }
}
