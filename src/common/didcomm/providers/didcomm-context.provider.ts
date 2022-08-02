import DidcommConfig from '@config/didcomm'
import ExpressConfig from '@config/express'
import { LoggerFactory } from '@logger'
import { Provider } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import {
  DidCommV2Service,
  DidDocumentBuilder,
  encodeToBase58,
  getEd25519VerificationMethod,
  getX25519VerificationMethod,
  Key,
  KeyType,
  PeerDid,
  PeerDidNumAlgo,
} from '@sicpa-dlab/peer-did-ts'
import * as ed25519 from '@stablelib/ed25519'
import { throwError } from '@utils/common'
import { makeMediationInvitation } from '@utils/invitation'

export class DidcommContext {
  public readonly did: string
  public readonly kid: string
  public readonly publicKey: string
  public readonly privateKey: string

  public constructor(props: DidcommContext) {
    this.did = props.did
    this.kid = props.kid
    this.publicKey = props.publicKey
    this.privateKey = props.privateKey
  }
}

export const DidcommContextProvider: Provider<DidcommContext> = {
  provide: DidcommContext,
  useFactory: (configService: ConfigService, loggerFactory: LoggerFactory) => {
    const logger = loggerFactory.getLogger().child('DidcommContextProvider')

    const expressConfig =
      configService.get<ConfigType<typeof ExpressConfig>>('express') ?? throwError('Express config is not defined')
    const didcommConfig =
      configService.get<ConfigType<typeof DidcommConfig>>('didcomm') ?? throwError('Didcomm config is not defined')

    const serviceEndpoint = `${expressConfig.publicUrl}/api/v1`
    const didcommContext = createDidcommContext(didcommConfig.mediatorSeed, serviceEndpoint)
    logger.traceObject({ didcommContext })

    const invitation = makeMediationInvitation(didcommContext.did, expressConfig.publicUrl)

    logger.info('------------------------------------------------------')
    logger.info(`MEDIATOR PROVISIONING INVITATION`)
    logger.info(invitation)
    logger.info('------------------------------------------------------')

    return didcommContext
  },
  inject: [ConfigService, LoggerFactory],
}

function createDidcommContext(seed: string, serviceEndpoint: string): DidcommContext {
  const keyPair = ed25519.generateKeyPairFromSeed(Buffer.from(seed))
  const privateKeyX25519 = ed25519.convertSecretKeyToX25519(keyPair.secretKey)
  const publicKeyX25519 = ed25519.convertPublicKeyToX25519(keyPair.publicKey)

  const ed25519Key = Key.fromPublicKey(keyPair.publicKey, KeyType.Ed25519)
  const x25519Key = Key.fromPublicKey(publicKeyX25519, KeyType.X25519)

  const didDocument = new DidDocumentBuilder('')
    .addAuthentication(getEd25519VerificationMethod({ controller: '', id: '', key: ed25519Key }))
    .addKeyAgreement(getX25519VerificationMethod({ controller: '', id: '', key: x25519Key }))
    .addService(new DidCommV2Service({ id: 'HTTP', serviceEndpoint, routingKeys: [], accept: ['didcomm/v2'] }))
    .build()

  const didPeer = PeerDid.fromDidDocument(didDocument, PeerDidNumAlgo.MultipleInceptionKeyWithoutDoc)

  return new DidcommContext({
    did: didPeer.did,
    kid: x25519Key.buildKeyId(didPeer.did),
    publicKey: x25519Key.publicKeyBase58,
    privateKey: encodeToBase58(privateKeyX25519),
  })
}
