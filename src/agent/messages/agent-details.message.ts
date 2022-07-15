import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Equals } from 'class-validator'

export class AgentDetailsMessage extends DidcommMessage {
  public constructor(params?: DidcommMessageParams) {
    super(params)
  }

  @Equals(AgentDetailsMessage.type)
  public readonly type = AgentDetailsMessage.type
  public static readonly type = 'https://didcomm.org/mediator/1.0/details'
}
