export default () => ({
  mediatorDid: process.env.MEDIATOR_DID || 'did:peer:0z6MkfJRtTAeMejSCZejdLPSDvLtfeNy34F24WSkwLRD4uPQV',
  mediatorKid:
    process.env.MEDIATOR_KID ||
    'did:peer:0z6MkfJRtTAeMejSCZejdLPSDvLtfeNy34F24WSkwLRD4uPQV#z6LSpGysEXPAiiSLaXG8txXAcc2jJzpbT9tYUKgyYXKKrkzR',
  // Base 58 encoding
  mediatorPublicKey: process.env.MEDIATOR_PUBLIC_KEY || 'DbohiDaJdFibV8tNNK1DJ1pFTrHUkYiPbLyJ44fo9PDf',
  mediatorPrivateKey: process.env.MEDIATOR_PRIVATE_KEY || '4Foqjv3XNrbiPKaVW97CFVoUg9EjJDmgRWb5o5Tz7or1',
})
