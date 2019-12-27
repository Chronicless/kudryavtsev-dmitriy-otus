const moment = require('moment');
const mongoose = require('mongoose');
const logger = require('../../logger').getlogger('mongo.suspiciousIps');

mongoose.Promise = global.Promise;
const db = require('./mongoConnection').connection;

const { Schema } = mongoose;
const ipsSchema = Schema({
  logins: [String],
  ip: String,
  attemps: Number,
  createdAt: { type: Date, expires: 3600 * 24 },
  updatedAt: { type: Date, expires: 3600 },

}, { timestamps: true });
const suspiciousIp = db.model('suspicious_ip', ipsSchema);

function checkIp(params) {
  return new Promise((resolve, reject) => {
    try {
      const query = { ip: params.ip };
      if (params.timeInterval) {
        query.updatedAt = { $gte: moment().add(-1 * params.timeInterval, 'm').toISOString() };
      }
      suspiciousIp.find(query, (err, searchResults) => {
        if (err) {
          logger.error('Error occurred while trying to execute find query ', query);
          logger.error(err);
          reject(err);
        } else {
          resolve(searchResults);
        }
      });
    } catch (e) {
      logger.error('Exception!', e);
      reject(e);
    }
  }
  );
}

function addAttempt(params) {
  return new Promise(((resolve, reject) => {
    try {
      const query = { ip: params.ip };
      const updateOptions = { $inc: { attemps: 1 } };
      if (params.login) {
        updateOptions.$addToSet = { logins: params.login };
      }
      suspiciousIp.update(query, updateOptions, { upsert: true }).then(resolve).catch((err) => {
        logger.error('Error occurred while trying to execute find query ', query);

        logger.error('Error occurred while trying to update login failed attems.', err);
        reject(err);
      });
    } catch (e) {
      logger.error('Exception!', e);
      reject(e);
    }
  }
  ));
}

module.exports = {
  checkIp,
  addAttempt,
};
