import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsNumber, IsObject, ValidateNested } from 'class-validator'

export type StatusResponseMessageParams = {
  body: StatusResponseBodyParams
} & DidcommMessageParams

export type StatusResponseBodyParams = {
  messageCount: number
}

class StatusResponse {
  @IsNumber()
  @Expose({ name: 'message_count' })
  public messageCount: number

  public constructor(params: StatusResponseBodyParams) {
    this.messageCount = params.messageCount
  }
}

export class StatusResponseMessage extends DidcommMessage {
  @IsObject()
  @ValidateNested()
  @Type(() => StatusResponse)
  public body!: StatusResponse

  @Equals(StatusResponseMessage.type)
  public readonly type = StatusResponseMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/2.0/status'

  public constructor(params?: StatusResponseMessageParams) {
    super(params)

    if (params) {
      this.body = params.body
    }
  }
}
