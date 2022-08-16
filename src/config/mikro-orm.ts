import * as fs from 'fs'

export default () => {
  const useSsl = process.env.MIKRO_ORM_USE_SSL === 'true'
  const sslOptions = useSsl ? JSON.parse(process.env.MIKRO_ORM_SSL_OPTIONS ?? '{}') : undefined

  if (sslOptions) {
    if (process.env.MIKRO_ORM_SSL_CA_PATH) {
      sslOptions.ca = fs.readFileSync(process.env.MIKRO_ORM_SSL_CA_PATH).toString()
    }
    if (process.env.MIKRO_ORM_SSL_KEY_PATH) {
      sslOptions.key = fs.readFileSync(process.env.MIKRO_ORM_SSL_KEY_PATH).toString()
    }
    if (process.env.MIKRO_ORM_SSL_CERT_PATH) {
      sslOptions.cert = fs.readFileSync(process.env.MIKRO_ORM_SSL_CERT_PATH).toString()
    }
  }

  return {
    type: process.env.MIKRO_ORM_DATABASE_TYPE || 'postgresql',
    host: process.env.MIKRO_ORM_HOST || 'localhost',
    port: process.env.MIKRO_ORM_PORT ? parseInt(process.env.MIKRO_ORM_PORT, 10) : 5432,
    user: process.env.MIKRO_ORM_USER || 'cloud_agent',
    password: process.env.MIKRO_ORM_PASSWORD || 'cloud_agent_password',
    dbName: process.env.MIKRO_ORM_DATABASE || 'cloud_agent',
    logging: process.env.MIKRO_ORM_LOGGING || 'all',
    driverOptions: {
      connection: {
        ssl: sslOptions,
        timezone: 'Z',
      },
    },
  }
}
