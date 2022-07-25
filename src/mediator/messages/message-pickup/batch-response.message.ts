import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Type } from 'class-transformer'
import { Equals, IsObject, ValidateNested } from 'class-validator'
import { MessagesResponse } from './messages-response'

export type BatchResponseMessageParams = {
  body: MessagesResponse
} & DidcommMessageParams

export class BatchResponseMessage extends DidcommMessage {
  @IsObject()
  @ValidateNested()
  @Type(() => MessagesResponse)
  public body!: MessagesResponse

  @Equals(BatchResponseMessage.type)
  public readonly type = BatchResponseMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/2.0/batch'

  public constructor(params?: BatchResponseMessageParams) {
    super(params)
    if (params) {
      this.body = params.body
    }
  }
}
