import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer'

export function convertToPlainJson<T>(classInstance: T): string {
  return JSON.stringify(instanceToPlain(classInstance, { exposeDefaultValues: true }))
}

export function parsePlainJson<T>(cls: ClassConstructor<T>, jsonString: string): T {
  return plainToInstance(cls, jsonString, { exposeDefaultValues: true })
}
