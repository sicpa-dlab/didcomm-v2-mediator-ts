import { ApiProperty } from '@nestjs/swagger'

export namespace MessageResponse {
  export class Message {
    @ApiProperty()
    public readonly message: string

    constructor(message: string) {
      this.message = message
    }
  }
}
