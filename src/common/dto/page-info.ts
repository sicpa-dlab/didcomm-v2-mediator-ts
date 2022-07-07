export class PageInfo {
  public readonly total: number
  public readonly offset: number
  public readonly limit: number

  constructor(props: PageInfo) {
    this.total = props.total
    this.offset = props.offset
    this.limit = props.limit
  }
}
