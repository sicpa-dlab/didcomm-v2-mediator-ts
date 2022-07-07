import { PageInfo } from '.'
import { ResponseWrapper } from './response-wrapper'

export class PaginatedResponseWrapper<T> extends ResponseWrapper<T[]> {
  public readonly total: number
  public readonly offset: number
  public readonly limit: number

  constructor(data: T[], pageInfo: PageInfo) {
    super(data)
    this.total = pageInfo.total
    this.offset = pageInfo.offset
    this.limit = pageInfo.limit
  }
}
