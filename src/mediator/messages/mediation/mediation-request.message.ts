import { DidcommMessage } from '@common/didcomm'
import { AgentDeliveryType } from '@common/entities/agent.entity'
import { Expose, Type } from 'class-transformer'
import { Equals, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'

export class MediationRequest {
  @IsEnum(AgentDeliveryType)
  @IsOptional()
  @Expose({ name: 'delivery_type' })
  public readonly deliveryType?: AgentDeliveryType

  @IsString()
  @IsOptional()
  @Expose({ name: 'delivery_data' })
  public readonly deliveryData?: string
}

export class MediationRequestMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => MediationRequest)
  public body!: MediationRequest

  @Equals(MediationRequestMessage.type)
  public readonly type = MediationRequestMessage.type
  public static readonly type = 'https://didcomm.org/coordinate-mediation/2.0/mediate-request'
}
