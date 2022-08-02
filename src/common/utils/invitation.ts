import { DidCommV2Service, PeerDid } from '@sicpa-dlab/peer-did-ts'
import { v4 } from 'uuid'

export const makeMediationInvitation = (did: string, endpoint: string): string => {
  const peerDid = PeerDid.fromDid(did)
  peerDid.didDocument.service = [new DidCommV2Service({ id: 'HTTP', serviceEndpoint: endpoint, routingKeys: [] })]

  const invitation = {
    typ: 'application/didcomm-plain+json',
    id: v4(),
    from: peerDid.did,
    body: {
      goal_code: 'mediator-provision',
    },
    type: 'https://didcomm.org/out-of-band/2.0/invitation',
    alg: 'HS256',
  }

  const encodedInvitation = Buffer.from(JSON.stringify(invitation)).toString('base64')
  return `${endpoint}/api/v1?oob=${encodedInvitation}`
}
