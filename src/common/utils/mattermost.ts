import ExpressConfig from '@config/express'
/* tslint:disable no-var-requires */
const Mattermost = require('node-mattermost')
/* tslint:disable no-var-requires */
const getVersion = require('git-repo-version')

export const sendNotification = async () => {
  const expressConfig = ExpressConfig()

  if (!expressConfig.notificationsEndpoint) return

  const mattermost = new Mattermost(expressConfig.notificationsEndpoint)
  await mattermost.send({
    username: 'Bot',
    text: `Application ${expressConfig.name}-${getVersion()} has been started.`,
  })
}
