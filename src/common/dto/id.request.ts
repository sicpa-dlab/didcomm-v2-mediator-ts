import { IsString } from 'class-validator'

export namespace IdRequest {
  export class Id {
    @IsString()
    public readonly id!: string
  }
}
