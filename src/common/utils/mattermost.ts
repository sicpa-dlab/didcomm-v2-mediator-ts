import ExpressConfig from '@config/express'
import * as nbgv from 'nerdbank-gitversioning'
/* tslint:disable no-var-requires */
const Mattermost = require('node-mattermost')

export const notify = async () => {
  const expressConfig = ExpressConfig()
  const versionInfo = await nbgv.getVersion()

  const mattermost = new Mattermost('https://chat.dsr-corporation.com/hooks/yoy5ay8kyjnbpnzu93aropjuna')
  await mattermost.send({
    username: 'Bot',
    text: `Application ${expressConfig.name}-${versionInfo.npmPackageVersion} has been started.`,
  })
}
