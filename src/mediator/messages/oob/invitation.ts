import { DidcommMessage } from '@common/didcomm/messages/didcomm.message'
import { Expose, instanceToPlain, Type } from 'class-transformer'
import { Equals, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator'

export enum GoalCode {
  MediatorProvision = 'mediator-provision',
}

export class InvitationBody {
  @IsString()
  @Expose({ name: 'goal_code' })
  public goalCode!: GoalCode

  @IsString()
  @IsOptional()
  public goal?: string
}

export class InvitationMessage extends DidcommMessage {
  @IsString()
  @IsNotEmpty()
  public from!: string

  @IsObject()
  @ValidateNested()
  @Type(() => InvitationBody)
  public body!: InvitationBody

  @Equals(InvitationMessage.type)
  public readonly type = InvitationMessage.type
  public static readonly type = 'https://didcomm.org/out-of-band/2.0/invitation'

  public toJSON({ endpoint }: { endpoint: string }) {
    const encodedInvitation = Buffer.from(JSON.stringify(instanceToPlain(this))).toString('base64')
    return `${endpoint}/api/v1?oob=${encodedInvitation}`
  }
}
