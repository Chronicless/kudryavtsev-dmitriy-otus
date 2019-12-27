const isProduction = process.env.production_mode === 'true';
const config = {
  name: 'otusRssHw',
  isProduction,
  env: isProduction ? 'production' : 'development',
  app: {
    port: process.env.rssExpressPort || 8000,
    hostname: isProduction ? 'chronicless.com' : 'localhost',
  },
  loggerConfig: {
    logPath: isProduction ? process.env.rssLogPath : './rssHw.log',
    fileSize: 204800,
    maxFiles: 3,
  },
  db: {
    mongodb: {
      express: {
        host: 'chronicless.com',
        port: process.env.rssMongoExpressPort || '27019',
        db: process.env.rssMongoExpressDb || 'express',
        user: process.env.rssMongoExpressUser || 'express',
        password: process.env.rssMongoExpressPwd || 'express12121212',
      },
      rssDatabase: {
        host: 'chronicless.com',
        port: process.env.rssMongoPort || '27019',
        db: process.env.rssMongoDb || 'otus',
        user: process.env.rssMongoUser || 'rss',
        password: process.env.rssMongoPwd || 'rss12121212',
      },
    },
  },
  maxUnsuccessfulLoginAttemps: 5,
  accessTokenExpirationMins: 60 * 24,
  secretSalt: 'oTuS_sEcReT',
};

// config values reutrns through getters function
// during active development config file changes
// it is much easier to change config structure and change link inside getters
// rather than looking for all dependencies in the code
module.exports = {
  getAppName: () => config.name,
  getEnv: () => config.env,
  isProduction: () => config.isProduction,
  getAppPort: () => config.app.port,
  getHostname: () => config.app.hostname,
  getLoggerConfig: () => config.loggerConfig,
  getMongoConnectionData: () => config.db.mongodb,
};
