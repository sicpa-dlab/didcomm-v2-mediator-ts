export default () => ({
  port: process.env.EXPRESS_PORT || 3000,
  enableCors: process.env.EXPRESS_ENABLE_CORS ? process.env.EXPRESS_ENABLE_CORS === 'true' : true,
  corsOptions: process.env.EXPRESS_CORS_OPTIONS ? JSON.parse(process.env.EXPRESS_CORS_OPTIONS) : {},
  prefix: process.env.EXPRESS_PREFIX || 'api',
})
