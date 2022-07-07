import { AgentDeliveryType } from '@common/entities/agent.entity'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsObject, IsString } from 'class-validator'

export namespace CreateRequest {
  export class Agent {
    @ApiProperty()
    @IsString()
    public readonly did!: string

    @ApiProperty()
    @IsEnum(AgentDeliveryType)
    public readonly deliveryType!: AgentDeliveryType

    @ApiProperty()
    @IsObject()
    public readonly deliveryData!: object
  }

  export namespace Swagger {
    export class CreateRequestAgent extends Agent {}
  }
}
