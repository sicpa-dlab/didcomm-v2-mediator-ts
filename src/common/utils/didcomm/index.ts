import { DidDocument } from '@sicpa-dlab/peer-did-ts'

export function getKidsFromDidDoc(didDoc: DidDocument): Array<string> {
  const result = new Array<string>()

  for (const keyAgreement of didDoc.keyAgreement) {
    const kid = typeof keyAgreement === 'string' ? keyAgreement : keyAgreement.id
    if (!result.includes(kid)) result.push(kid)
  }

  return result
}
