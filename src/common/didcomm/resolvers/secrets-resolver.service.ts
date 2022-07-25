import DidcommConfig from '@config/didcomm'
import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { KeyType } from '@sicpa-dlab/peer-did-ts'
import { throwError } from '@utils/common'
import { Secret, SecretsResolver } from 'didcomm-node'

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
  private readonly didcommConfig: ConfigType<typeof DidcommConfig>

  constructor(
    @InjectLogger(SecretsResolverService)
    private readonly logger: Logger,
    configService: ConfigService,
  ) {
    const _logger = logger.child('constructor')
    _logger.trace('>')

    this.didcommConfig =
      configService.get<ConfigType<typeof DidcommConfig>>('didcomm') ?? throwError('Didcomm config is not defined')

    _logger.trace('<')
  }

  public async find_secrets(secret_ids: Array<string>): Promise<Array<string>> {
    const logger = this.logger.child('find_secrets')
    logger.trace({ secret_ids }, '>')

    const { mediatorKid } = this.didcommConfig

    const foundSecrets = secret_ids.includes(mediatorKid) ? [mediatorKid] : []

    logger.trace({ foundSecrets }, '<')
    return foundSecrets
  }

  public async get_secret(secret_id: string): Promise<Secret | null> {
    const logger = this.logger.child('get_secret')
    logger.trace({ secret_id }, '>')

    const { mediatorKid, mediatorPrivateKey } = this.didcommConfig

    if (secret_id !== mediatorKid || !mediatorPrivateKey) return null

    logger.trace('<')
    return {
      id: mediatorKid,
      type: keyTypesMapping[KeyType.X25519],
      secret_material: { format: 'Base58', value: mediatorPrivateKey },
    }
  }
}
