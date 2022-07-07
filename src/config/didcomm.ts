export default () => ({
  mediatorDid: process.env.MEDIATOR_DID,
  mediatorPublicKey: process.env.MEDIATOR_PUBLIC_KEY ? Buffer.from(process.env.MEDIATOR_PUBLIC_KEY, 'base64') : null,
  mediatorPrivateKey: process.env.MEDIATOR_PRIVATE_KEY ? Buffer.from(process.env.MEDIATOR_PRIVATE_KEY, 'base64') : null,
})
