export class ResponseWrapper<T> {
  public readonly data: T

  constructor(data: T) {
    this.data = data
  }
}
