import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { PageInfo } from '@common/dto'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsObject, IsString, ValidateNested } from 'class-validator'

export type DidListResponseMessageParams = {
  body: DidListResponse
} & DidcommMessageParams

export type DidListResponseBodyParams = {
  dids: DidListResponseItem[]
  pagination: PageInfo
}

export class DidListResponse {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DidListResponseItem)
  public dids: DidListResponseItem[]

  @IsObject()
  @ValidateNested()
  @Type(() => PageInfo)
  public pagination: PageInfo

  public constructor(params: DidListResponseBodyParams) {
    this.dids = params.dids
    this.pagination = params.pagination
  }
}

export class DidListResponseItem {
  @IsString()
  @Expose({ name: 'recipient_did' })
  public recipientDid!: string

  public constructor(recipientDid: string) {
    this.recipientDid = recipientDid
  }
}

export class DidListResponseMessage extends DidcommMessage {
  @IsObject()
  @ValidateNested()
  @Type(() => DidListResponse)
  public body!: DidListResponse

  @Equals(DidListResponseMessage.type)
  public readonly type = DidListResponseMessage.type
  public static readonly type = 'https://didcomm.org/coordinate-mediation/2.0/didlist'

  public constructor(params?: DidListResponseMessageParams) {
    super(params)

    if (params) {
      this.body = params.body
    }
  }
}
