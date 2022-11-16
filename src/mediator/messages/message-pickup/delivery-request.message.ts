import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'

export type DeliveryRequestMessageParams = {
  from: string
  body: DeliveryRequestBody
} & DidcommMessageParams

class DeliveryRequestBody {
  @IsNumber()
  public limit!: number

  @IsString()
  @IsOptional()
  @Expose({ name: 'recipient_key' })
  public recipientKey?: string
}

export class DeliveryRequestMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => DeliveryRequestBody)
  public body!: DeliveryRequestBody

  @Equals(DeliveryRequestMessage.type)
  public readonly type = DeliveryRequestMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/3.0/delivery-request'

  public constructor(params?: DeliveryRequestMessageParams) {
    super(params)
    if (params) {
      this.body = params.body
    }
  }
}
