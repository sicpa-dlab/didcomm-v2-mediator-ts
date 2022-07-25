import { DidcommMessage } from '@common/didcomm'
import { PaginationQuery } from '@common/dto'
import { Type } from 'class-transformer'
import { Equals, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

export class DidListQuery {
  @IsObject()
  @ValidateNested()
  @Type(() => PaginationQuery)
  public paginate!: PaginationQuery
}

export class DidListQueryMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => DidListQuery)
  public body!: DidListQuery

  @Equals(DidListQueryMessage.type)
  public readonly type = DidListQueryMessage.type
  public static readonly type = 'https://didcomm.org/coordinate-mediation/2.0/didlist-query'
}
