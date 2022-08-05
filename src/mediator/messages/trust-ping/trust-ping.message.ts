import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsBoolean, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

class TrustPingBody {
  @IsBoolean()
  @Expose({ name: 'response_requested' })
  public responseRequested!: boolean
}

export class TrustPingMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => TrustPingBody)
  public body!: TrustPingBody

  @Equals(TrustPingMessage.type)
  public readonly type = TrustPingMessage.type
  public static readonly type = 'https://didcomm.org/trust-ping/2.0/ping'
}
