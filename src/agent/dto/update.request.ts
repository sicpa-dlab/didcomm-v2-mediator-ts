import { AgentDeliveryType } from '@common/entities/agent.entity'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsObject } from 'class-validator'

export namespace UpdateRequest {
  export class Agent {
    @ApiProperty()
    @IsEnum(AgentDeliveryType)
    public readonly deliveryType!: AgentDeliveryType

    @ApiProperty()
    @IsObject()
    public readonly deliveryData!: object
  }

  export namespace Swagger {
    export class UpdateRequestAgent extends Agent {}
  }
}
