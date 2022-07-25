import { AgentDeliveryType } from '@common/entities/agent.entity'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export namespace CreateRequest {
  export class Agent {
    @IsString()
    public readonly did!: string

    @IsEnum(AgentDeliveryType)
    @IsOptional()
    public readonly deliveryType?: AgentDeliveryType

    @IsString()
    @IsOptional()
    public readonly deliveryData?: string
  }

  export namespace Swagger {
    export class CreateRequestAgent extends Agent {}
  }
}
