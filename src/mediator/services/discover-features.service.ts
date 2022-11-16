import { DidcommContext } from '@common/didcomm/providers'
import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { DiscloseMessage, QueriesMessage } from '../messages/discover-features'

@Injectable()
export class DiscoverFeaturesService {
  constructor(
    private readonly didcommContext: DidcommContext,
    @InjectLogger(DiscoverFeaturesService)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async processDiscoverFeaturesQuery(msg: QueriesMessage): Promise<DiscloseMessage | undefined> {
    const logger = this.logger.child('processDiscoverFeaturesQuery', { msg })
    logger.trace('>')

    const res: DiscloseMessage = new DiscloseMessage({
      from: this.didcommContext.did,
      to: [msg.from],
      body: {
        disclosures: [
          { 'feature-type': 'protocol', id: 'https://didcomm.org/coordinate-mediation/2.0' },
          { 'feature-type': 'protocol', id: 'https://didcomm.org/discover-features/2.0' },
          { 'feature-type': 'protocol', id: 'https://didcomm.org/messagepickup/3.0' },
          { 'feature-type': 'protocol', id: 'https://didcomm.org/trust-ping/2.0' },
        ],
      },
    })

    logger.trace({ res }, '<')
    return res
  }
}
