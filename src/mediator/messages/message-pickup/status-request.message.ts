import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'

export type StatusRequestMessageParams = {
  from: string
  body: StatusRequestBody
} & DidcommMessageParams

class StatusRequestBody {
  @IsString()
  @IsOptional()
  @Expose({ name: 'recipient_key' })
  public recipientKey?: string
}

export class StatusRequestMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => StatusRequestBody)
  public body!: StatusRequestBody

  @Equals(StatusRequestMessage.type)
  public readonly type = StatusRequestMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/3.0/status-request'

  public constructor(params?: StatusRequestMessageParams) {
    super(params)
    if (params) {
      this.body = params.body
    }
  }
}
