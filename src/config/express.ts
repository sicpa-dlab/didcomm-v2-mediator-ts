export default () => ({
  publicUrl: process.env.EXPRESS_PUBLIC_URL || 'http://192.168.1.47:3000',
  publicWsUrl: process.env.EXPRESS_PUBLIC_WS_URL || 'ws://192.168.1.47:3000',
  port: process.env.EXPRESS_PORT || 3000,
  enableCors: process.env.EXPRESS_ENABLE_CORS ? process.env.EXPRESS_ENABLE_CORS === 'true' : true,
  corsOptions: process.env.EXPRESS_CORS_OPTIONS ? JSON.parse(process.env.EXPRESS_CORS_OPTIONS) : {},
  prefix: process.env.EXPRESS_PREFIX || 'api',
  jsonContentHeaders: process.env.EXPRESS_JSON_CONTENT_HEADERS || ['application/ssi-agent-wire', 'application/json'],
  requestSizeLimit: process.env.EXPRESS_REQUEST_SIZE_LIMIT || '10mb',
})
