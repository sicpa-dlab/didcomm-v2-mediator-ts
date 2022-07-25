import { DidcommMessage } from '@common/didcomm'
import { Equals, IsNotEmpty, IsString } from 'class-validator'

export class StatusRequestMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @Equals(StatusRequestMessage.type)
  public readonly type = StatusRequestMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/2.0/status-request'
}
