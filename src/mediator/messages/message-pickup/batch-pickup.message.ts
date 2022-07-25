import { DidcommMessage } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from 'class-validator'

class BatchPickup {
  @IsNumber()
  @Expose({ name: 'batch_size' })
  public batchSize!: number
}

export class BatchPickupMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => BatchPickup)
  public body!: BatchPickup

  @Equals(BatchPickupMessage.type)
  public readonly type = BatchPickupMessage.type
  public static readonly type = 'https://didcomm.org/messagepickup/2.0/batch-pickup'
}
