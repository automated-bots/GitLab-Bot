const pino = require('pino')

const NODE_ENV = process.env.NODE_ENV || 'development'

const envToLogger = {
  development: {
    level: process.env.PINO_LOG_LEVEL || 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  },
  production: {
    level: process.env.PINO_LOG_LEVEL || 'info',
    formatters: {
      level: (label) => {
        return { level: label }
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  }
}

module.exports = pino(
  envToLogger[NODE_ENV]
)
