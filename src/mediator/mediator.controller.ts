import { EncryptedMessage } from '@common/didcomm/messages'
import { SignedMessage } from '@common/didcomm/messages/signed.message'
import { InjectLogger, Logger } from '@logger'
import { Body, Controller, Header, Post } from '@nestjs/common'
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RouterService } from './services/router.service'

@ApiTags('Mediator')
@Controller('v1')
export class MediatorController {
  constructor(
    private readonly routerService: RouterService,
    @InjectLogger(MediatorController)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  @ApiOperation({ summary: 'Post mediation message.' })
  @ApiOkResponse({ description: 'Mediation message successfully processed.' })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'Not Found.' })
  @Header('Content-Type', 'application/ssi-agent-wire')
  @Post()
  public async postMessage(
    @Body() msg: EncryptedMessage | SignedMessage,
  ): Promise<EncryptedMessage | SignedMessage | void> {
    const logger = this.logger.child('postMessage', { msg })
    logger.trace('>')

    const responseMsg = await this.routerService.processMessage(msg)

    if (responseMsg) {
      logger.trace({ responseMsg }, '<')
      return responseMsg
    }

    logger.trace('<')
  }
}
