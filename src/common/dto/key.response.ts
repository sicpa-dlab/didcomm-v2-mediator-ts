import { ApiProperty } from '@nestjs/swagger'

export namespace KeyResponse {
  export class Key {
    @ApiProperty()
    public readonly key: string

    constructor(key: string) {
      this.key = key
    }
  }
}
