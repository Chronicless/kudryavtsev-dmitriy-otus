const db = require('../db');
const logger = require('../logger').getlogger('route.main');
const { nvl } = require('../helpers');

exports.indexMainPage = function indexMainPage(req, res) {
  logger.debug('Main page open request');
  const title = req.session.username ? `${req.session.username}, welcome back` : 'This is educational RSS API server';
  const params = {
    authenticated: !!nvl(req.session.auth),
    userStatus: nvl(req.session.userStatus),
  };
  try {
    res.render('pages/index.ejs', { title, params });
  } catch (e) {
    res.render('pages/index.ejs', { authenticated: '', userStatus: '', title });
  }
};

exports.loginPage = function loginPage(req, res) {
  logger.debug('New login request ', req.headers);
  const params = {
    authenticated: !!nvl(req.session.auth),
    userStatus: nvl(req.session.userStatus),
  };
  if (req.method === 'GET') {
    if (params.authenticated) {
      res.redirect('/');
    } else {
      res.render('pages/login.ejs', { params });
    }
  } else if (req.method === 'POST') {
    db.users.authUser(req, res);
  } else {
    res.status(405).json({ error: 'Method not supported' });
  }
};

exports.signupPage = async function signupPage(req, res) {
  const params = {
    authenticated: !!nvl(req.session.auth),
    userStatus: nvl(req.session.userStatus),
  };
  const email = req.body.email || req.query.email;
  try {
    switch (req.method) {
      case 'GET':
        res.render('pages/signup.ejs', { params });
        break;
      case 'POST':
        logger.debug('New user creation request.', req.body);
        if (!email || email.length === 0) {
          res.status(400).json({ message: 'Wrong email' });
          break;
        }
        await db.users.createUser({
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
        }).catch((err) => {
          logger.info('Signup error: ', err.message);
          throw err;
        });
        logger.info('User created.', req.body);
        // auth

        req.headers.authorization = `Basic ${Buffer.from(`${req.body.email}:${req.body.password}`).toString('base64')}`;
        await db.users.authUser(req, res);

        break;
      default:
        res.status(405).json({ error: 'Method not supported' });
    }
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

exports.logoutPage = function logoutPage(req, res) {
  try {
    const { username } = req.session;

    req.session.destroy((err) => {
      if (err) {
        logger.error('Username %s logout error: ', username, err.message);
      } else {
        logger.info('Username %s logout success', username);
      }
    });

    res.redirect('/');
  } catch (e) {
    logger.error('Exception!', e);
    res.status(500).json({ error: 'internal server error' });
  }
};
