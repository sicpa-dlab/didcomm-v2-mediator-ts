import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { PaginationQuery } from '@common/dto'
import { Type } from 'class-transformer'
import { Equals, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

export type DidListQueryMessageParams = {
  from: string
  body: DidListQuery
} & DidcommMessageParams

export class DidListQuery {
  @IsObject()
  @ValidateNested()
  @Type(() => PaginationQuery)
  public paginate!: PaginationQuery
}

export class KeyListQueryMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => DidListQuery)
  public body!: DidListQuery

  @Equals(KeyListQueryMessage.type)
  public readonly type = KeyListQueryMessage.type
  public static readonly type = 'https://didcomm.org/coordinate-mediation/2.0/keylist-query'

  public constructor(params?: DidListQueryMessageParams) {
    super(params)
    if (params) {
      this.body = params.body
    }
  }
}
