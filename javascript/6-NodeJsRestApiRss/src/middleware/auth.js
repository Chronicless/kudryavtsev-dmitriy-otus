const logger = require('../logger').getlogger('middleware.auth');

function authenticate(req, res, next) {
  try {
    if (req.session.auth) {
      next();
    } else {
      res.status(403).json({ error: 'You do not have access to this page' });
    }
  } catch (e) {
    logger.error('Exception!', e);
    res.status(500).json({ error: 'internal server error' });
  }
}

module.exports = {
  authenticate,
};
