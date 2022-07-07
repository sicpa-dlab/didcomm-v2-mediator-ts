import { AgentDeliveryType } from '@common/entities/agent.entity'
import { ApiProperty } from '@nestjs/swagger'

export namespace GetResponse {
  export class Agent {
    @ApiProperty()
    public readonly deliveryType: AgentDeliveryType

    @ApiProperty()
    public readonly deliveryData: object

    constructor(props: Agent) {
      this.deliveryType = props.deliveryType
      this.deliveryData = props.deliveryData
    }
  }

  export namespace Swagger {
    export class GetResponseAgent extends Agent {}
  }
}
