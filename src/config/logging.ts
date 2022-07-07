export default () => ({
  excludePaths: process.env.LOGGING_EXCLUDE_PATHS || ['/health'],
})
