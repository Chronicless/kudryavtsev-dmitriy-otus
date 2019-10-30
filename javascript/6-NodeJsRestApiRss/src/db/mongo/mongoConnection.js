const mongoose = require('mongoose');

mongoose.set('useCreateIndex', true); // fix for https://github.com/Automattic/mongoose/issues/6890
mongoose.Promise = global.Promise;
const config = require('../../config');
const logger = require('../../logger').getlogger('db.mongoConnection');


function connectWithRetry( url, name) {
  const conn = mongoose.createConnection(url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      reconnectTries: 3600, // default 30
      reconnectInterval: 5000, // default 1000
    }, (err) => {
      if (err) {
        logger.error(`Failed to connect to mongo - retrying in 5 sec. Database error message : ${err}`);
        setTimeout(() => { connectWithRetry(conn); }, 5000);
      }
    });

  conn.on('error', (err) => {
    logger.fatal(`error connecting to mongodb database ${name}: `, err);
  });

  conn.on('connected', () => {
    logger.info(`Mongo ${name} connected `);
  });
  conn.on('disconnected', () => {
    logger.info(`Mongo ${name} disconnected`);
  });

  conn.on('close', () => {
    logger.warn(`Connection to ${name} has been closed. Trying to reopen`);
    connectWithRetry(conn);
  });
  return conn;
}

const expressConnData = config.getMongoConnectionData().express;
const connectionData = config.getMongoConnectionData().rssDatabase;

const connectionString = `mongodb://${connectionData.user}:${connectionData.password}@${connectionData.host}:${connectionData.port}/${connectionData.db}`;
const connection = connectWithRetry(connectionString, 'rssDatabase');

const expressConnString = `mongodb://${expressConnData.user}:${expressConnData.password}@${expressConnData.host}:${expressConnData.port}/${expressConnData.db}`;
const expressConnection = connectWithRetry(expressConnString,'expressDatabase');




module.exports = {
  expressConnection,
  connection,
};
