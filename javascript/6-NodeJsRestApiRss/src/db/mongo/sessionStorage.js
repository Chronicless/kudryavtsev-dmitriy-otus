// express session storage
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { expressConnection } = require('./mongoConnection');

const mongoSessionStorage = new MongoStore({
  mongooseConnection: expressConnection,
  collection: 'sessions',
  autoReconnect: true,
  ttl: 60 * 60,
  autoRemove: 'native',
});

module.exports = mongoSessionStorage;
