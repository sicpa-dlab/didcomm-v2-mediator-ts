import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsBoolean, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

class LiveModeChangeBody {
  @IsBoolean()
  @Expose({ name: 'live_delivery' })
  public liveDelivery!: boolean
}

export class LiveModeChangeMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => LiveModeChangeBody)
  public body!: LiveModeChangeBody

  @Equals(LiveModeChangeMessage.type)
  public readonly type = LiveModeChangeMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/3.0/live-delivery-change'
}
