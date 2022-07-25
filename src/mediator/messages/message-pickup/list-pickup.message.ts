import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { ArrayNotEmpty, Equals, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

class ListPickup {
  @IsArray()
  @ArrayNotEmpty()
  @Expose({ name: 'message_ids' })
  public messageIds!: string[]
}

export class ListPickupMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => ListPickup)
  public body!: ListPickup

  @Equals(ListPickupMessage.type)
  public readonly type = ListPickupMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/2.0/list-pickup'
}
