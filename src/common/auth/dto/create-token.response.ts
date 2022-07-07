import { ApiProperty } from '@nestjs/swagger'

export namespace CreateTokenResponse {
  export class Descriptor {
    @ApiProperty()
    public readonly authToken: string

    constructor(props: Descriptor) {
      this.authToken = props.authToken
    }
  }
}
