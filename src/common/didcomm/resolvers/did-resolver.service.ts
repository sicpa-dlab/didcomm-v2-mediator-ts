import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { DidDocument, PeerDid, PeerDidNumAlgo } from '@sicpa_open_source/peer-did-ts'

@Injectable()
export class DidResolverService {
  constructor(
    @InjectLogger(DidResolverService)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async resolve(did: string): Promise<DidDocument | null> {
    const peerDid = PeerDid.fromDid(did)

    if (peerDid.numAlgo === PeerDidNumAlgo.GenesisDoc) {
      throw new Error('Method 1 peer did resolution is not supported')
    }

    return peerDid.didDocument
  }
}
