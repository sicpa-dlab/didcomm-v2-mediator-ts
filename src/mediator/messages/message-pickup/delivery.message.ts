import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'
import { Attachment } from 'didcomm'

export type DeliveryMessageParams = {
  body: DeliveryBody
  attachments: Attachment[]
  thid?: string
} & DidcommMessageParams

class DeliveryBody {
  @IsString()
  @IsOptional()
  @Expose({ name: 'recipient_key' })
  public recipientKey?: string
}

export class DeliveryMessage extends DidcommMessage {
  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryBody)
  public body!: DeliveryBody

  @Equals(DeliveryMessage.type)
  public readonly type = DeliveryMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/3.0/delivery'

  public attachments!: Array<Attachment>

  public constructor(params?: DeliveryMessageParams) {
    super(params)
    if (params) {
      this.body = params.body
      this.attachments = params.attachments
    }
  }
}
