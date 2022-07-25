export default () => ({
  mediatorDid:
    process.env.MEDIATOR_DID ||
    'did:peer:2.Ez6LSqJfn7fymyLNR3AqsUWo13e31srQpaL9F1ocUnNasUp9V.Vz6MkpBtRPku3GUmKjyNCWf2BtxSBhNiFMkSxkAJZs6yWcn2y.SeyJzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS92MSIsInQiOiJkbSIsInIiOltdLCJhIjpbImRpZGNvbW0vdjIiXX0',
  mediatorKid:
    process.env.MEDIATOR_KID ||
    'did:peer:2.Ez6LSqJfn7fymyLNR3AqsUWo13e31srQpaL9F1ocUnNasUp9V.Vz6MkpBtRPku3GUmKjyNCWf2BtxSBhNiFMkSxkAJZs6yWcn2y.SeyJzIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwL2FwaS92MSIsInQiOiJkbSIsInIiOltdLCJhIjpbImRpZGNvbW0vdjIiXX0#z6LSqJfn7fymyLNR3AqsUWo13e31srQpaL9F1ocUnNasUp9V',
  // Base 58 encoding
  mediatorPublicKey: process.env.MEDIATOR_PUBLIC_KEY || 'EdVcbNAussefwnU6wsH3j3pY2hshsiy68ptoHuwLmSNj',
  mediatorPrivateKey: process.env.MEDIATOR_PRIVATE_KEY || '3jTtztd6zbZthDmiwokMRd4P8WDMeToBud21WC72kryX',
})
