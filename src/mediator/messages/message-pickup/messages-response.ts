import { IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'
import { Attachment } from 'didcomm'

export interface MessagesResponseParams {
  messages: MessageAttachment[]
}

export class MessagesResponse {
  @IsArray()
  @ValidateNested({ each: true })
  public messages: MessageAttachment[]

  public constructor(params: MessagesResponseParams) {
    this.messages = params.messages
  }
}

export class MessageAttachment {
  @IsString()
  @IsNotEmpty()
  public id: string

  @IsObject()
  @IsNotEmpty()
  public message: Attachment

  public constructor(props: MessageAttachment) {
    this.id = props.id
    this.message = props.message
  }
}
