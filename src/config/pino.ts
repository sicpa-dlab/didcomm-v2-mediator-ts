export default () => ({
  prettyPrint: process.env.PINO_PRETTY_PRINT
    ? process.env.PINO_PRETTY_PRINT === 'true'
    : {
        colorize: true,
        translateTime: true,
      },
  level: process.env.PINO_LEVEL || 'info',
  redact: {
    paths: ['password', '*.password'],
    censor: '******',
  },
})
