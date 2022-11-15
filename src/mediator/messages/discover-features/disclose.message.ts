import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'
import { DidListUpdate } from '../did-list'

export class DisclosuresBody {
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

export class DisclosuresMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsString()
  @IsNotEmpty()
  public thid!: string

  @IsObject()
  @ValidateNested()
  @Type(() => DisclosuresBody)
  public body!: DisclosuresBody

  @Equals(DisclosuresMessage.type)
  public readonly type = DisclosuresMessage.type
  public static readonly type = 'https://didcomm.org/discover-features/2.0/queries'
}
