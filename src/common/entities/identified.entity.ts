import { PrimaryKey } from '@mikro-orm/core'
import { v4 } from 'uuid'

export class Identified {
  @PrimaryKey()
  public id: string = v4()
}
