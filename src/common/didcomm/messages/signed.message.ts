import { parsePlainJson } from '@utils/json'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator'

export class SignatureHeader {
  @IsString()
  @IsNotEmpty()
  public kid!: string
}

export class Signature {
  @IsObject()
  @ValidateNested()
  @Type(() => SignatureHeader)
  public header!: string

  @IsString()
  @IsNotEmpty()
  public protected!: string

  @IsString()
  @IsNotEmpty()
  public signature!: string
}

export class SignedMessage {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Signature)
  public signature!: Signature[]

  @IsString()
  @IsNotEmpty()
  public payload!: string

  public static fromJson(jsonMessage: string): SignedMessage {
    return parsePlainJson(SignedMessage, jsonMessage)
  }
}
