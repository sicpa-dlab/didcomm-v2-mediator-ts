import { AgentDeliveryType } from '@common/entities/agent.entity'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsString } from 'class-validator'

export namespace CreateRequest {
  export class Agent {
    @ApiProperty()
    @IsString()
    public readonly did!: string

    @ApiProperty()
    @IsEnum(AgentDeliveryType)
    public readonly deliveryType!: AgentDeliveryType

    @ApiProperty()
    @IsString()
    public readonly deliveryData!: string
  }

  export namespace Swagger {
    export class CreateRequestAgent extends Agent {}
  }
}
