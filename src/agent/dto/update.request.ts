import { AgentDeliveryType } from '@common/entities/agent.entity'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString } from 'class-validator'

export namespace UpdateRequest {
  export class Agent {
    @ApiProperty()
    @IsEnum(AgentDeliveryType)
    public readonly deliveryType!: AgentDeliveryType

    @ApiProperty()
    @IsString()
    public readonly deliveryData!: string
  }

  export namespace Swagger {
    export class UpdateRequestAgent extends Agent {}
  }
}
