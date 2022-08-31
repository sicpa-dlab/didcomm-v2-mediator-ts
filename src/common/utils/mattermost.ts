import ExpressConfig from '@config/express'
import * as nbgv from 'nerdbank-gitversioning'
/* tslint:disable no-var-requires */
const Mattermost = require('node-mattermost')

export const sendNotification = async () => {
  const expressConfig = ExpressConfig()
  const versionInfo = await nbgv.getVersion()

  if (!expressConfig.notificationsEndpoint) return

  const mattermost = new Mattermost(expressConfig.notificationsEndpoint)
  await mattermost.send({
    username: 'Bot',
    text: `Application ${expressConfig.name}-${versionInfo.npmPackageVersion} has been started.`,
  })
}
