import { applyDecorators } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsInt, IsOptional, IsPositive, Min } from 'class-validator'

export class PaginationQuery {
  @Transform((offset) => parseInt(offset.value, 10))
  @IsOptional()
  @Min(0)
  @IsInt()
  public readonly offset: number = 0

  @Transform((limit) => parseInt(limit.value, 10))
  @IsOptional()
  @IsPositive()
  @IsInt()
  public readonly limit: number = 50
}

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({ name: 'offset', required: false, type: Number }),
    ApiQuery({ name: 'limit', required: false, type: Number }),
  )
}
