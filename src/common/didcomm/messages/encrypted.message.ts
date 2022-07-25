import { parsePlainJson } from '@utils/json'
import { Expose, Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

class RecipientHeader {
  @IsString()
  @IsNotEmpty()
  public kid!: string
}

export class EncryptedMessageRecipient {
  @IsObject()
  @ValidateNested()
  @Type(() => RecipientHeader)
  public header!: RecipientHeader

  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'encrypted_key' })
  public encryptedKey!: string
}

export class EncryptedMessage {
  @IsString()
  @IsNotEmpty()
  public protected!: string

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => EncryptedMessageRecipient)
  public recipients!: EncryptedMessageRecipient[]

  @IsString()
  @IsNotEmpty()
  public iv!: string

  @IsString()
  @IsNotEmpty()
  public ciphertext!: string

  @IsString()
  @IsNotEmpty()
  public tag!: string

  public static fromJson(jsonMessage: string): EncryptedMessage {
    return parsePlainJson(EncryptedMessage, jsonMessage)
  }
}
