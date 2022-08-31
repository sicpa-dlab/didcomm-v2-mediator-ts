import path from 'path'

export default () => ({
  level: process.env.PINO_LEVEL || 'warning',
  redact: {
    paths: ['password', '*.password'],
    censor: '******',
  },
  logFilePath: process.env.PINO_LOG_FILE_PATH || path.join('logs', 'all.log'),
})
