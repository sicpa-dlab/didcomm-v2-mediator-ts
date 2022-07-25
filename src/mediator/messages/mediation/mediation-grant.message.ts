import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

export type MediationGrantMessageParams = {
  body: MediationGrant
} & DidcommMessageParams

export type MediationGrantBodyParams = {
  endpoint: string
  routingKeys: string[]
}

export class MediationGrant {
  @IsNotEmpty()
  @IsArray()
  @Expose({ name: 'routing_keys' })
  public routingKeys!: string[]

  @IsNotEmpty()
  @IsString()
  public endpoint!: string

  public constructor(params: MediationGrantBodyParams) {
    this.routingKeys = params.routingKeys
    this.endpoint = params.endpoint
  }
}

export class MediationGrantMessage extends DidcommMessage {
  @Equals(MediationGrantMessage.type)
  public readonly type = MediationGrantMessage.type
  public static readonly type = 'https://didcomm.org/coordinate-mediation/2.0/mediate-grant'

  @IsObject()
  @ValidateNested()
  @Type(() => MediationGrant)
  public body!: MediationGrant

  constructor(params?: MediationGrantMessageParams) {
    super(params)

    if (params) {
      this.body = params.body
    }
  }
}
