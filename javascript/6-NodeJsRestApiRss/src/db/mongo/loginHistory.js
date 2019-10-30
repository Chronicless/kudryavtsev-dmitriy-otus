
const mongoose = require('mongoose');
const logger = require('../../logger').getlogger('mongo.loginHistory');

mongoose.Promise = global.Promise;
const db = require('./mongoConnection').connection;

const { Schema } = mongoose;
const loginHistorySchema = Schema({
  username: String,
  email: String,
  login_type: String,
  ip: String,
  user_agent: String,
}, { timestamps: true });

const LoginHistory = db.model('login_history', loginHistorySchema);

function getHistory(params) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = {};
      if (params.username) query.username = params.username;
      if (params.email) query.email = params.email;

      const data = await LoginHistory.find(query);
      resolve(data);
    } catch (e) {
      logger.error('Exception!', e);
      reject(e);
    }
  });
}

function addAttempt(params) {
  return new Promise(async (resolve, reject) => {
    try {
      const newEvent = new LoginHistory({
        username: params.username,
        email: params.email,
        login_type: params.login_type,
        ip: params.ip,
        user_agent: params.user_agent,
      });

      await newEvent.save();
      resolve();
    } catch (e) {
      logger.error('Exception!', e);
      reject(e);
    }
  });
}

module.exports = {
  getHistory,
  addAttempt,
};
