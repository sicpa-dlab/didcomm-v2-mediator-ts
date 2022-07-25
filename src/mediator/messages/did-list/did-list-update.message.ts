import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsEnum, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

class DidListUpdateBody {
  @Type(() => DidListUpdate)
  @IsArray()
  @ValidateNested({ each: true })
  public updates!: DidListUpdate[]
}

export class DidListUpdate {
  @IsString()
  @Expose({ name: 'recipient_did' })
  public recipientDid!: string

  @IsEnum(() => DidListUpdateAction)
  public action!: DidListUpdateAction
}

export enum DidListUpdateAction {
  Add = 'add',
  Remove = 'remove',
}

export class DidListUpdateMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => DidListUpdateBody)
  public body!: DidListUpdateBody

  @Equals(DidListUpdateMessage.type)
  public readonly type = DidListUpdateMessage.type
  public static readonly type = 'https://didcomm.org/coordinate-mediation/2.0/didlist-update'
}
