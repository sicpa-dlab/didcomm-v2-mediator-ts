import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'

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
}
