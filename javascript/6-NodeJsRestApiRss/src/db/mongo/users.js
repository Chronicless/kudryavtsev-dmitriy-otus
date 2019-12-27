const bcrypt = require('bcrypt');
const auth = require('basic-auth');
const mongoose = require('mongoose');
const logger = require('../../logger').getlogger('dbModule.mongo');
const helpers = require('../../helpers');
const db = require('./mongoConnection').connection;
const suspiciousIps = require('./suspiciousIps');
const loginHistory = require('./loginHistory');

mongoose.Promise = global.Promise;

const { Schema } = mongoose;
const userSchema = Schema({
  username: String,
  password: String,
  email: String,
  created: Date,
  last_login: Date,
  status: String,
  subscriptions: { type: [Schema.Types.ObjectId], ref: 'rssLinks'},
});
const mongoUser = db.model('User', userSchema);

function createUser(newUser) {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await mongoUser.findOne({ email: newUser.email });
      if (checkUser) {
        logger.error('Cannon create new user, user with this email already exists :', newUser.email);
        reject(new Error('User/Email already exists'));
        return;
      }
      const rounds = 10;
      const salt = bcrypt.genSaltSync(rounds);
      const hash = bcrypt.hashSync(newUser.password, salt);
      // eslint-disable-next-line new-cap
      const newMongoUser = new mongoUser({
        password: hash,
        created: new Date(),
        status: 'new',
        username: newUser.username,
        email: newUser.email,
      });

      logger.debug('creating new user ', newMongoUser.username);
      await newMongoUser.save();
      resolve();
    } catch (e) {
      logger.error('Error!', e);
      reject(e);
      // telegram notification here
    }
  });
}

async function authUser(req, res) {
  return new Promise(async (resolve, reject) => {
    try {
      const remoteIp = helpers.getIpFromRequest(req);
      const credentials = auth(req);
      let match;
      logger.debug('Trying to authenticate user : ', credentials ? credentials.name : 'NULL');
      if (!credentials || !credentials.name || !credentials.pass) {
        res.status(401).json({ status: 'Auth failed', message: 'Access denied' });
        logger.debug('Name or pass not found');
      } else {
        const user = await mongoUser.findOne({ email: credentials.name });
        if (!user) {
          res.status(401).json({ status: 'Auth failed', message: 'User not found' });
          logger.warn('There is no such user( %s ) in database', credentials.name);
          suspiciousIps.addAttempt({ ip: remoteIp, login: credentials.name });
          return;
        }
        match = bcrypt.compareSync(credentials.pass, user.password);
        if (match) {
          logger.debug('User %s auth successful , updating last api request field', credentials.name);
          // eslint-disable-next-line no-underscore-dangle
          req.session.userId = user._id;
          req.session.username = user.username;
          req.session.email = user.email;
          req.session.auth = true;
          // everything is ok with password

          loginHistory.addAttempt({
            username: user.username,
            email: user.email,
            login_type: 'web',
            ip: remoteIp,
            user_agent: req.headers['user-agent'],
          });
          await mongoUser.update(
            { _id: user._id },
            { $currentDate: { last_login: true } },
            { multi: false },
          );

          res.status(200).json({ status: 'success' });
        } else {
          res.status(401).json({ status: 'Auth failed', message: 'Wrong password' });
          suspiciousIps.addAttempt({ ip: remoteIp, login: credentials.name });
        }
      }
    } catch (e) {
      logger.error('Exception!', e);
      res.status(401).json({ status: 'Auth failed', message: 'Access denied' });
      // telegram notification here
      reject(e);
    }
  });
}

function getUserRssLinks(userId) {
  return new Promise(async (resolve, reject) => {
    const userData = await mongoUser.findById(userId)
      .catch((err) => {
        const msg = `Failed to get user data by id ${userId}`;
        logger.error(msg);
        reject(msg);
      });
    logger.debug(userData);
    if (userData && userData.subscriptions && userData.subscriptions.length > 0) {
      resolve(userData.subscriptions);
    } else {
      resolve([]);
    }

  });
}

function addRssLinkToUser(rssLinkId, userId) {
  return new Promise(async (resolve, reject) => {
    await mongoUser.update(
      { _id: userId },
      // addToSet handles duplicates automatically
      // so there is no need to check did this user already has this link or not
      { $addToSet: { subscriptions: rssLinkId } },
      { multi: false },
    ).catch((err) => {
      logger.error(`Failed to add new rssLink with id ${rssLinkId} to user list. Error ${err}`);
      reject();
    });
    resolve();
  });
}

function removeRssLinkFromUser(rssLinkId, userId) {
  return new Promise(async (resolve, reject) => {
    await mongoUser.update(
      { _id: userId },
      // addToSet handles duplicates automatically
      // so there is no need to check did this user already has this link or not
      { $pull: { subscriptions: rssLinkId } },
      { multi: false },
    ).catch((err) => {
      logger.error(`Failed to add new rssLink with id ${rssLinkId} to user list. Error ${err}`);
      reject();
    });
    resolve();
  });
}

module.exports = {
  createUser,
  authUser,
  getUserRssLinks,
  addRssLinkToUser,
  removeRssLinkFromUser,
};
