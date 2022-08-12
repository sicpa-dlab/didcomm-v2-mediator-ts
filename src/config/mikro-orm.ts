export default () => ({
  type: process.env.MIKRO_ORM_DATABASE_TYPE || 'postgresql',
  host: process.env.MIKRO_ORM_HOST || 'localhost',
  port: process.env.MIKRO_ORM_PORT ? parseInt(process.env.MIKRO_ORM_PORT, 10) : 5432,
  user: process.env.MIKRO_ORM_USER || 'cloud_agent',
  password: process.env.MIKRO_ORM_PASSWORD || 'cloud_agent_password',
  dbName: process.env.MIKRO_ORM_DATABASE || 'cloud_agent',
  logging: process.env.MIKRO_ORM_LOGGING || 'all',
  sslOptions: process.env.MIKRO_ORM_SSL_OPTIONS ? JSON.parse(process.env.MIKRO_ORM_SSL_OPTIONS) : false,
})
