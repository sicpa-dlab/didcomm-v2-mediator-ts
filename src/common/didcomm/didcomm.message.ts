import type { Attachment } from 'didcomm'

import { Expose } from 'class-transformer'
import { IsArray, IsNumber, IsOptional, IsString, Matches } from 'class-validator'

import { JsonEncoder } from '@sicpa-dlab/peer-did-ts'
import { v4 } from 'uuid'

export const MessageIdRegExp = /[-_./a-zA-Z0-9]{8,64}/
export const MessageTypeRegExp = /(.*?)([a-zA-Z0-9._-]+)\/(\d[^/]*)\/([a-zA-Z0-9._-]+)$/

export const ATTACHMENT_MEDIA_TYPE = 'application/json'

export type DidcommMessageParams = {
  id?: string
  from?: string
  to?: string
  thid?: string
  pthid?: string
  created_time?: number
  expires_time?: number
  from_prior?: string
  attachments?: Array<Attachment>
  body?: unknown
}

export class DidcommMessage {
  @Expose({ name: 'id' })
  @Matches(MessageIdRegExp)
  public id!: string

  @Expose({ name: 'type' })
  @Matches(MessageTypeRegExp)
  public readonly type!: string
  public static readonly type: string

  @Expose({ name: 'typ' })
  public readonly typ = DidcommMessage.typ
  public static readonly typ = 'application/didcomm-plain+json'

  @Expose({ name: 'from' })
  @IsString()
  @IsOptional()
  public from?: string

  @Expose({ name: 'to' })
  @IsArray()
  @IsOptional()
  public to?: Array<string>

  @IsNumber()
  @IsOptional()
  public created_time?: number

  @IsNumber()
  @IsOptional()
  public expires_time?: number

  @IsString()
  @IsOptional()
  public thid?: string

  @IsString()
  @IsOptional()
  public pthid?: string

  @IsString()
  @IsOptional()
  public from_prior?: string

  public body!: unknown

  @IsOptional()
  public attachments?: Array<Attachment>

  public constructor(options?: DidcommMessageParams) {
    if (options) {
      this.id = options.id || this.generateId()
      this.from = options.from
      this.to = options.to ? [options.to] : undefined
      this.thid = options.thid
      this.pthid = options.pthid
      this.created_time = options.created_time
      this.expires_time = options.expires_time
      this.from_prior = options.from_prior
      this.attachments = options.attachments
      this.body = options.body || {}
    }
  }

  public generateId() {
    return v4()
  }

  public static createJSONAttachment<T>(id: string, message: T): Attachment {
    return {
      id,
      media_type: ATTACHMENT_MEDIA_TYPE,
      data: {
        json: message,
      },
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static createBase64Attachment<T>(id: string, message: T): Attachment {
    return {
      id,
      media_type: ATTACHMENT_MEDIA_TYPE,
      data: {
        base64: JsonEncoder.toBase64(message),
      },
    }
  }

  public getAttachmentDataAsJson(id: string) {
    if (!this.attachments) return null
    const attachment = this.attachments?.find((it) => it.id === id)
    if (!attachment) return null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = attachment.data as any // FIXME: didcomm package doesn't provide convenient way to process attachment
    if (typeof data.base64 === 'string') {
      return JsonEncoder.fromBase64(data.base64)
    } else if (data.json) {
      return data.json
    } else {
      return null
    }
  }
}
