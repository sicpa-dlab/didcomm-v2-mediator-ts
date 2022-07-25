import { DidcommMessage, DidcommMessageParams } from '@common/didcomm'
import { Expose, Type } from 'class-transformer'
import { Equals, IsArray, IsEnum, IsInstance, IsObject, IsString, ValidateNested } from 'class-validator'
import { DidListUpdateAction } from './did-list-update.message'

export enum DidListUpdateResult {
  ClientError = 'client_error',
  ServerError = 'server_error',
  NoChange = 'no_change',
  Success = 'success',
}

export type DidListUpdatedMessageParams = {
  body: DidListUpdateResponseBody
} & DidcommMessageParams

export type DidListUpdatedBodyParams = {
  recipientDid: string
  action: DidListUpdateAction
  result: DidListUpdateResult
}

export class DidListUpdated {
  @IsString()
  @Expose({ name: 'recipient_did' })
  public recipientDid!: string

  @IsEnum(() => DidListUpdateAction)
  public action!: DidListUpdateAction

  @IsEnum(() => DidListUpdateResult)
  public result!: DidListUpdateResult

  public constructor(params: DidListUpdatedBodyParams) {
    this.recipientDid = params.recipientDid
    this.action = params.action
    this.result = params.result
  }
}

export class DidListUpdateResponseBody {
  @Type(() => DidListUpdated)
  @IsArray()
  @ValidateNested()
  @IsInstance(DidListUpdated, { each: true })
  public updated: DidListUpdated[]

  public constructor(updated: DidListUpdated[]) {
    this.updated = updated
  }
}

export class DidListUpdateResponseMessage extends DidcommMessage {
  @IsObject()
  @ValidateNested()
  @Type(() => DidListUpdateResponseBody)
  public body!: DidListUpdateResponseBody

  @Equals(DidListUpdateResponseMessage.type)
  public readonly type = DidListUpdateResponseMessage.type
  public static readonly type = 'https://didcomm.org/coordinate-mediation/2.0/didlist-update-response'

  public constructor(params: DidListUpdatedMessageParams) {
    super(params)
    this.body = params.body
  }
}
