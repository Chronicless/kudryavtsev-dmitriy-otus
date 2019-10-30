const log4js = require('log4js');
const config = require('../config');

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'file',
      filename: config.getLoggerConfig().logPath,
      maxLogSize: config.getLoggerConfig().fileSize,
      backups: config.getLoggerConfig().maxFiles,
    },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: config.isProduction() ? 'info' : 'trace' },
  },
  pm2: true
});

exports.getlogger = function getLogger4Module(moduleName) {
  return log4js.getLogger(`${config.getAppName()}.${moduleName}`);
};
