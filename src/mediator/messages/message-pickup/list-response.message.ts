import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Type } from 'class-transformer'
import { Equals, IsObject, ValidateNested } from 'class-validator'
import { MessagesResponse } from './messages-response'

export type ListResponseMessageParams = {
  body: MessagesResponse
} & DidcommMessageParams

export class ListResponseMessage extends DidcommMessage {
  @IsObject()
  @ValidateNested()
  @Type(() => MessagesResponse)
  public body!: MessagesResponse

  @Equals(ListResponseMessage.type)
  public readonly type = ListResponseMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/2.0/list-response'

  public constructor(params?: ListResponseMessageParams) {
    super(params)
    if (params) {
      this.body = params.body
    }
  }
}
