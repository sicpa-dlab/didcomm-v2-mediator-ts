import { PageInfo } from '.'
import { ResponseWrapper } from './response-wrapper'

export class PaginatedResponseWrapper<T> extends ResponseWrapper<T[]> {
  public readonly remaining: number
  public readonly offset: number
  public readonly count: number

  constructor(data: T[], pageInfo: PageInfo) {
    super(data)
    this.remaining = pageInfo.remaining
    this.offset = pageInfo.offset
    this.count = pageInfo.count
  }
}
