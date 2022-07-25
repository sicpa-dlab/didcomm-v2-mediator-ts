import { DidcommMessage, DidcommMessageParams } from '@common/didcomm/messages/didcomm.message'
import { Type } from 'class-transformer'
import { Equals, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'
import { Attachment } from 'didcomm-node'

export interface DidcommForwardMessageParams extends DidcommMessageParams {
  next: string
}

export class DidcommForwardMessageBody {
  @IsString()
  @IsNotEmpty()
  public next!: string

  public constructor(params?: DidcommForwardMessageParams) {
    if (params) {
      this.next = params.next
    }
  }
}

export class DidcommForwardMessage extends DidcommMessage {
  @IsObject()
  @ValidateNested()
  @Type(() => DidcommForwardMessageBody)
  public body!: DidcommForwardMessageBody

  @IsArray()
  public attachments!: Array<Attachment>

  @Equals(DidcommForwardMessage.type)
  public readonly type = DidcommForwardMessage.type
  public static readonly type = 'https://didcomm.org/routing/2.0/forward'

  constructor(params?: DidcommForwardMessageParams) {
    super(params)

    if (params) {
      this.body = new DidcommForwardMessageBody(params)
    }
  }
}
