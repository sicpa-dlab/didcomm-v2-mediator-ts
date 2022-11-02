import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator'

class BatchAck {}

export class BatchAckMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @Type(() => BatchAck)
  public body!: BatchAck

  // custom_ack can be removed once didcomm-jvm will implement V2 spec
  // Related issue: https://github.com/sicpa-dlab/cbdc-projects/issues/1597
  @IsArray()
  @IsString({ each: true })
  @Expose({ name: 'custom_ack' })
  public ack!: string[]

  @Equals(BatchAckMessage.type)
  public readonly type = BatchAckMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/2.0/ack'
}
