export default () => ({
  mimeType: process.env.DIDCOMM_MIME_TYPE || 'application/ssi-agent-wire',
  mediatorSeed: process.env.DIDCOMM_MEDIATOR_SEED || '3918c59689d24b7fbc5eab27686bd921',
})
