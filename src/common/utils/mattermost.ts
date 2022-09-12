import ExpressConfig from '@config/express'
import { LoggerFactory } from '@logger'
/* tslint:disable no-var-requires */
const Mattermost = require('node-mattermost')

export const sendNotification = async () => {
  const loggerFactory = new LoggerFactory()
  const logger = loggerFactory.getLogger().child('> Notifications').child('sendNotification')

  try {
    const expressConfig = ExpressConfig()
    logger.info(`Send notification to Mattermost ${expressConfig.notificationsEndpoint}`)

    if (!expressConfig.notificationsEndpoint) return

    const mattermost = new Mattermost(expressConfig.notificationsEndpoint)
    await mattermost.send({
      username: 'Bot',
      text: `Application ${expressConfig.name} has been started. Version: ${process.env.npm_package_version}`,
    })
  } catch (e) {
    logger.error(`Unable to send notification to Mattermost. Error: ${e}`)
  }
}
