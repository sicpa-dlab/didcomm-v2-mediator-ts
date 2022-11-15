import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'
import { DidListUpdate } from '../did-list'

export class QueriesBody {
  @Type(() => DidListUpdate)
  @IsArray()
  @ValidateNested({ each: true })
  public queries!: Query[]
}

export class Query {
  @IsString()
  @Expose({ name: 'feature-type' })
  public featureType!: string

  @IsString()
  public match!: string
}

export class QueriesMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => QueriesBody)
  public body!: QueriesBody

  @Equals(QueriesMessage.type)
  public readonly type = QueriesMessage.type
  public static readonly type = 'https://didcomm.org/discover-features/2.0/queries'
}
