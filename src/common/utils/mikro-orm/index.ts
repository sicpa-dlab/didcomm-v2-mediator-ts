import { Logger } from '@logger'
import {
  AnyEntity,
  Dictionary,
  DriverException,
  EntityManager,
  EntityName,
  FilterQuery,
  IPrimaryKey,
  LockMode,
  QueryOrder,
  QueryOrderNumeric,
  Utils,
} from '@mikro-orm/core'
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Type,
} from '@nestjs/common'

export type Ordering = QueryOrder | QueryOrderNumeric | keyof typeof QueryOrder

export const Like = (q: string) => new RegExp(`^.*${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*$`)

export const OrderBy = <T>(keys: (keyof T)[], order: Ordering) =>
  keys
    .map((key) => ({
      [key]: order,
    }))
    .reduce((acc, item) => ({ ...acc, ...item }), {})

export type HandlerFn = (entityName: string, where: Dictionary | IPrimaryKey | any) => Error

export interface FailHandlerOptions {
  message: (entityName: string) => string
  logLevel: keyof Pick<Logger, 'trace' | 'debug' | 'info' | 'warn' | 'error'>
  exception: Type<HttpException>
  logMsg?: string
}

export function failHandler(logger: Logger, options: FailHandlerOptions) {
  return (entityName: string, where: Dictionary | IPrimaryKey | any): Error => {
    const err = new options.exception(options.message(entityName))
    logger[options.logLevel]({ err, entityName, where }, `! ${options.logMsg || 'not found'}`)
    return err
  }
}

export function badRequestHandler(logger: Logger, options?: Partial<FailHandlerOptions>): HandlerFn {
  return failHandler(logger, {
    exception: BadRequestException,
    message: (entityName) => `${entityName} not found!`,
    logLevel: 'info',
    ...options,
  })
}

export function notFoundHandler(logger: Logger, options?: Partial<FailHandlerOptions>): HandlerFn {
  return failHandler(logger, {
    exception: NotFoundException,
    message: (entityName) => `${entityName} not found!`,
    logLevel: 'info',
    ...options,
  })
}

export function accessDeniedHandler(logger: Logger, options?: Partial<FailHandlerOptions>): HandlerFn {
  return failHandler(logger, {
    exception: ForbiddenException,
    message: (entityName) => `${entityName} access denied!`,
    logLevel: 'warn',
    ...options,
  })
}

export function internalServerErrorHandler(logger: Logger, options?: Partial<FailHandlerOptions>): HandlerFn {
  return failHandler(logger, {
    exception: InternalServerErrorException,
    message: (entityName) => `${entityName} doesn't exists!`,
    logLevel: 'error',
    ...options,
  })
}

export function conflictHandler(logger: Logger, options?: Partial<FailHandlerOptions>): HandlerFn {
  return failHandler(logger, {
    exception: ConflictException,
    message: (entityName) => `${entityName} already exists!`,
    logLevel: 'info',
    logMsg: 'already exists',
    ...options,
  })
}

export async function failIfExists<T extends AnyEntity<T>>(
  em: EntityManager,
  entityName: EntityName<T>,
  where: FilterQuery<T>,
  _failHandler: HandlerFn,
): Promise<void> {
  const conflict = await em.count<T>(entityName, where).then((count) => count > 0)
  if (conflict) {
    throw _failHandler(Utils.className(entityName), where)
  }
}

export async function createIfNotExists<T extends AnyEntity<T>>(
  em: EntityManager,
  entityName: EntityName<T>,
  where: FilterQuery<T>,
  factoryFn: () => T,
): Promise<T> {
  const existingEntity = await em.findOne(entityName, where)

  if (existingEntity) {
    return existingEntity
  }

  const entity = factoryFn()

  try {
    await em.persistAndFlush(entity)
    return entity
  } catch (err) {
    if (err instanceof DriverException && err.code !== 'ER_DUP_ENTRY') {
      throw err
    }

    // Just in case
    // If entity was inserted in a short window between findOne and persistAndFlush
    return await em.findOneOrFail(entityName, where, {
      failHandler: (e, w) => new InternalServerErrorException(`Can't find entity that must exists: ${e}: ${w}`),
    })
  }
}

export async function upsertAndFlush<T extends AnyEntity<T>>(
  em: EntityManager,
  entityName: EntityName<T>,
  where: FilterQuery<T>,
  factoryFn: () => T,
  mutatorFn: (e: T) => void,
): Promise<T> {
  const entity = await createIfNotExists(em, entityName, where, factoryFn)

  await em.transactional(async (tem) => {
    await tem.lock(entity, LockMode.PESSIMISTIC_WRITE)
    mutatorFn(entity)
  })

  return entity
}
