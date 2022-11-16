import { DidcommContext } from '@common/didcomm/providers'
import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { DiscloseMessage, QueriesMessage } from '../messages/discover-features'
import { FeatureTypes, ProtocolRoles } from '../messages/discover-features/disclose.message'

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
          {
            featureType: FeatureTypes.Protocol,
            id: 'https://didcomm.org/coordinate-mediation/2.0',
            roles: [ProtocolRoles.Mediator],
          },
          {
            featureType: FeatureTypes.Protocol,
            id: 'https://didcomm.org/discover-features/2.0',
            roles: [ProtocolRoles.Responder],
          },
          {
            featureType: FeatureTypes.Protocol,
            id: 'https://didcomm.org/messagepickup/3.0',
            roles: [ProtocolRoles.Mediator],
          },
          {
            featureType: FeatureTypes.Protocol,
            id: 'https://didcomm.org/trust-ping/2.0',
            roles: [ProtocolRoles.Receiver],
          },
        ],
      },
      thid: msg.id,
    })

    logger.trace({ res }, '<')
    return res
  }
}
