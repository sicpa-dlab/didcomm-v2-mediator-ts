import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Equals } from 'class-validator'

export type MediationDenyMessageParams = {} & DidcommMessageParams

export class MediationDenyMessage extends DidcommMessage {
  @Equals(MediationDenyMessage.type)
  public readonly type = MediationDenyMessage.type
  public static readonly type = 'https://didcomm.org/coordinate-mediation/2.0/mediate-deny'

  public constructor(params?: MediationDenyMessageParams) {
    super(params)
  }
}
