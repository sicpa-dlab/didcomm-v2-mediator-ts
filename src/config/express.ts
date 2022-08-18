import fs from 'fs'

export default () => {
  const useHttps = process.env.EXPRESS_USE_HTTPS === 'true'
  const httpsOptions = useHttps ? JSON.parse(process.env.EXPRESS_HTTPS_OPTIONS ?? '{}') : undefined

  if (httpsOptions) {
    if (process.env.EXPRESS_SSL_CA_PATH) {
      httpsOptions.ca = fs.readFileSync(process.env.EXPRESS_SSL_CA_PATH).toString()
    }
    if (process.env.EXPRESS_SSL_KEY_PATH) {
      httpsOptions.key = fs.readFileSync(process.env.EXPRESS_SSL_KEY_PATH).toString()
    }
    if (process.env.EXPRESS_SSL_CERT_PATH) {
      httpsOptions.cert = fs.readFileSync(process.env.EXPRESS_SSL_CERT_PATH).toString()
    }
  }

  return {
    publicUrl: process.env.EXPRESS_PUBLIC_URL || 'http://localhost:3000',
    publicWsUrl: process.env.EXPRESS_PUBLIC_WS_URL || 'ws://localhost:3000',
    port: process.env.EXPRESS_PORT || 3000,
    enableCors: process.env.EXPRESS_ENABLE_CORS ? process.env.EXPRESS_ENABLE_CORS === 'true' : true,
    corsOptions: process.env.EXPRESS_CORS_OPTIONS ? JSON.parse(process.env.EXPRESS_CORS_OPTIONS) : {},
    prefix: process.env.EXPRESS_PREFIX || 'api',
    httpsOptions,
    jsonContentHeaders: process.env.EXPRESS_JSON_CONTENT_HEADERS || ['application/ssi-agent-wire', 'application/json'],
    requestSizeLimit: process.env.EXPRESS_REQUEST_SIZE_LIMIT || '10mb',
  }
}
