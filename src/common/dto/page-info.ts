export class PageInfo {
  public readonly remaining: number
  public readonly offset: number
  public readonly count: number

  constructor(props: PageInfo) {
    this.remaining = props.remaining
    this.offset = props.offset
    this.count = props.count
  }
}
