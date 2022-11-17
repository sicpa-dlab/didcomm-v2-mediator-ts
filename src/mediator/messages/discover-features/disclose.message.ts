import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'
import { DidListUpdate } from '../key-list'

export enum FeatureTypes {
  Protocol = 'protocol',
  Constraint = 'constraint',
}

export enum ProtocolRoles {
  Mediator = 'mediator',
  Responder = 'responder',
  Receiver = 'receiver',
}

export type DiscloseMessageParams = {
  from: string
  thid: string
  body: DiscloseBody
} & DidcommMessageParams

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

  public constructor(params?: DiscloseMessageParams) {
    super(params)
    if (params) {
      this.body = params.body
    }
  }
}
