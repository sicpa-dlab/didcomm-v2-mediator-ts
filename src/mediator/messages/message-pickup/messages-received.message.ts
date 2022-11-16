import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { ArrayNotEmpty, Equals, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

export type MessagesReceivedMessageParams = {
  from: string
  body: MessagesReceivedBody
} & DidcommMessageParams

class MessagesReceivedBody {
  @IsArray()
  @ArrayNotEmpty()
  @Expose({ name: 'message_id_list' })
  public messageIdList!: string[]
}

export class MessagesReceivedMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => MessagesReceivedBody)
  public body!: MessagesReceivedBody

  @Equals(MessagesReceivedMessage.type)
  public readonly type = MessagesReceivedMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/3.0/messages-received'

  public constructor(params?: MessagesReceivedMessageParams) {
    super(params)
    if (params) {
      this.body = params.body
    }
  }
}
