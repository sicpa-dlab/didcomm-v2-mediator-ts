import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'
import { DidListUpdate } from '../did-list'

export class DiscloseBody {
  @Type(() => DidListUpdate)
  @IsArray()
  @ValidateNested({ each: true })
  public disclosures!: Disclosure[]
}

export class Disclosure {
  @IsString()
  @Expose({ name: 'feature-type' })
  public featureType!: string

  @IsString()
  public id!: string

  @IsArray()
  public roles!: string[]
}

export class DiscloseMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsString()
  @IsNotEmpty()
  public thid!: string

  @IsObject()
  @ValidateNested()
  @Type(() => DiscloseBody)
  public body!: DiscloseBody

  @Equals(DiscloseMessage.type)
  public readonly type = DiscloseMessage.type
  public static readonly type = 'https://didcomm.org/discover-features/2.0/disclose'
}
