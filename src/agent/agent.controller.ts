import { ApiIdRequest } from '@common/decorators/api-id-request.decorator'
import { IdRequest, IdResponse, MessageResponse, ResponseWrapper } from '@common/dto'
import { InjectLogger, Logger } from '@logger'
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'
import { AgentService } from './agent.service'
import { CreateRequest, UpdateRequest } from './dto'

@ApiTags('Agents')
@Controller('v1/agents')
export class AgentController {
  constructor(
    private readonly agentsService: AgentService,
    @InjectLogger(AgentController)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  @ApiOperation({ summary: 'Create new agent' })
  @ApiOkResponse({
    description: 'Created agent mediation record id.',
    type: IdResponse.Id,
  })
  @ApiBody({ description: 'Create agent request', type: CreateRequest.Swagger.CreateRequestAgent })
  @ApiCreatedResponse({ description: 'Agent mediation record created.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({ description: 'Conflict.' })
  @Post()
  public async create(@Body() req: CreateRequest.Agent): Promise<ResponseWrapper<IdResponse.Id>> {
    const logger = this.logger.child('create', { req })
    logger.trace('>')

    const idResponse = await this.agentsService.create(req)
    logger.traceObject({ idResponse })

    const res = new ResponseWrapper(idResponse)
    logger.trace({ res }, '<')
    return res
  }

  @ApiOperation({ summary: 'Get agent mediation record data.' })
  @ApiOkResponse({
    description: 'Agent mediation record data.',
    type: MessageResponse.Message,
  })
  @ApiIdRequest()
  @Get(':id')
  public async get(@Param() params: IdRequest.Id): Promise<ResponseWrapper<MessageResponse.Message>> {
    const logger = this.logger.child('get', { params })
    logger.trace('>')

    const agent = await this.agentsService.get(params.id)
    logger.traceObject({ agent })

    const res = new ResponseWrapper(agent)
    logger.trace({ res }, '<')
    return res
  }

  @ApiOperation({ summary: 'Update existing agent mediation record' })
  @ApiBody({ description: 'Agent mediator data', type: UpdateRequest.Swagger.UpdateRequestAgent })
  @ApiOkResponse({ description: 'Agent mediation record updated.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'Not Found.' })
  @ApiIdRequest()
  @Put(':id')
  public async update(@Param() params: IdRequest.Id, @Body() req: UpdateRequest.Agent): Promise<void> {
    const logger = this.logger.child('update', { params })
    logger.trace('>')

    await this.agentsService.update(params.id, req)

    logger.trace('<')
  }

  @ApiOperation({ summary: 'Remove an agent mediation record.' })
  @ApiOkResponse({ description: 'Agent mediation record was deleted.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'Not Found.' })
  @ApiIdRequest()
  @Delete(':id')
  public async delete(@Param() params: IdRequest.Id): Promise<void> {
    const logger = this.logger.child('delete', { params })
    logger.trace('>')

    await this.agentsService.delete(params.id)

    logger.trace('<')
  }
}
