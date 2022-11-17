import { DidResolverService } from '@common/didcomm/resolvers/did-resolver.service'
import { InjectLogger, Logger } from '@logger'
import { Injectable } from '@nestjs/common'
import { DidCommService, DidCommV2Service, DidDocument, VerificationMethod } from '@sicpa_open_source/peer-did-ts'
import { DIDDoc, DIDResolver } from 'didcomm-node'

export type DidcommDidDoc = DIDDoc

@Injectable()
export class DidcommDidResolverService implements DIDResolver {
  constructor(
    private readonly resolverService: DidResolverService,
    @InjectLogger(DidcommDidResolverService)
    private readonly logger: Logger,
  ) {
    this.logger.child('constructor').trace('<>')
  }

  public async resolve(did: string): Promise<DidcommDidDoc | null> {
    const didDoc = await this.resolverService.resolve(did)

    if (!didDoc) {
      throw new Error(`Unable to resolve DIDDoc for ${did}`)
    }

    return this.parseDidcommDidDoc(didDoc)
  }

  private parseDidcommDidDoc(didDoc: DidDocument): DidcommDidDoc {
    const verificationMethods = didDoc.verificationMethod.map((verificationMethod) =>
      DidcommDidResolverService.mapVerificationMethod(verificationMethod),
    )

    const services = didDoc.service.map((service) => ({
      id: service.id,
      kind:
        service instanceof DidCommService || service instanceof DidCommV2Service
          ? {
              DIDCommMessaging: {
                service_endpoint: service.serviceEndpoint,
                accept: service.accept || [],
                routing_keys: service.routingKeys || [],
              },
            }
          : {
              Other: {
                type: service.type,
                serviceEndpoint: service.serviceEndpoint,
              },
            },
    }))

    const didcommDidDoc: DidcommDidDoc = {
      did: didDoc.id,
      verification_methods: verificationMethods,
      services,
      key_agreements: [],
      authentications: [],
    }

    for (const keyAgreement of didDoc.keyAgreement) {
      if (typeof keyAgreement === 'string') {
        didcommDidDoc.key_agreements.push(keyAgreement)
      } else {
        didcommDidDoc.key_agreements.push(keyAgreement.id)
        didcommDidDoc.verification_methods.push(DidcommDidResolverService.mapVerificationMethod(keyAgreement))
      }
    }

    for (const authentication of didDoc.authentication) {
      if (typeof authentication === 'string') {
        didcommDidDoc.authentications.push(authentication)
      } else {
        didcommDidDoc.authentications.push(authentication.id)
        didcommDidDoc.verification_methods.push(DidcommDidResolverService.mapVerificationMethod(authentication))
      }
    }

    return didcommDidDoc
  }

  private static mapVerificationMethod(verificationMethod: VerificationMethod) {
    return {
      id: verificationMethod.id,
      type: verificationMethod.type,
      controller: verificationMethod.controller,
      verification_material: verificationMethod.publicKeyBase58
        ? { format: 'Base58', value: verificationMethod.publicKeyBase58 }
        : verificationMethod.publicKeyMultibase
        ? { format: 'Multibase', value: verificationMethod.publicKeyMultibase }
        : verificationMethod.publicKeyHex
        ? { format: 'Hex', value: verificationMethod.publicKeyHex }
        : verificationMethod.publicKeyJwk
        ? { format: 'JWK', value: verificationMethod.publicKeyJwk }
        : {
            format: 'Other',
            value:
              verificationMethod.publicKeyPem ||
              verificationMethod.publicKeyBase64 ||
              verificationMethod.blockchainAccountId ||
              verificationMethod.ethereumAddress,
          },
    }
  }
}
