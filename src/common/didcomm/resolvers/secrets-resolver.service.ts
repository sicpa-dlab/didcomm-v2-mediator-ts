import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { KeyType } from '@sicpa_open_source/peer-did-ts'
import { Secret, SecretsResolver } from 'didcomm-node'
import { DidcommContext } from '../providers'

const keyTypesMapping = {
  [KeyType.Ed25519]: 'Ed25519VerificationKey2018',
  [KeyType.X25519]: 'X25519KeyAgreementKey2019',
  [KeyType.Secp256k1]: 'EcdsaSecp256k1VerificationKey2019',
  [KeyType.Bls12381g1g2]: '',
  [KeyType.Bls12381g1]: '',
  [KeyType.Bls12381g2]: '',
}

@Injectable()
export class SecretsResolverService implements SecretsResolver {
  constructor(
    private readonly didcommContext: DidcommContext,
    @InjectLogger(SecretsResolverService)
    private readonly logger: Logger,
  ) {
    logger.child('constructor').trace('<>')
  }

  public async find_secrets(secret_ids: Array<string>): Promise<Array<string>> {
    const logger = this.logger.child('find_secrets')
    logger.trace({ secret_ids }, '>')

    const { kid } = this.didcommContext

    const foundSecrets = secret_ids.includes(kid) ? [kid] : []

    logger.trace({ foundSecrets }, '<')
    return foundSecrets
  }

  public async get_secret(secret_id: string): Promise<Secret | null> {
    const logger = this.logger.child('get_secret')
    logger.trace({ secret_id }, '>')

    const { kid, privateKey } = this.didcommContext

    if (secret_id !== kid) return null

    logger.trace('<')
    return {
      id: kid,
      type: keyTypesMapping[KeyType.X25519],
      secret_material: { format: 'Base58', value: privateKey },
    }
  }
}
