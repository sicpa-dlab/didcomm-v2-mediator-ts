import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Required = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()
  if (!req[data]) {
    throw new BadRequestException(`${data} is required!`)
  }

  return req[data]
})
