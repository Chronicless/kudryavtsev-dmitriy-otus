const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const favicon = require('serve-favicon');

const mw = require('./middleware');
const routes = require('./routes');
const config = require('./config');
const logger = require('./logger').getlogger('app');

const env = config.getEnv();
const { sessionStorage } = require('./db');

const app = express();

logger.info('Starting RSS storage application...');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use('/static', express.static(`${__dirname}/static`));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(path.join(__dirname, 'static', 'favicon.ico')));

app.use(cookieParser());
app.use(helmet());
app.use('/static', express.static(`${__dirname}/static`));

app.use(session({
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  secret: 'Chr0n1cless',
  saveUninitialized: true,
  resave: true,
  store: sessionStorage,
}));

logger.info(`Starting on env : ${env}`);
// Routing
// API

app.use('/login', routes.main.loginPage);
app.use('/signup', routes.main.signupPage);
app.use('/logout', routes.main.logoutPage);
app.use('/rss', routes.rss);
app.get('/', routes.main.indexMainPage);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Page Under Construction! =) \r Please check later or contact with admin');
  err.status = 404;
  logger.debug('Requested not existing page', req.url);
  next(err.message);
});

// error handlers

// development error handler
// will print stacktrace
if (!config.isProduction()) {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
} else {
  // production error handler
// no stacktraces leaked to user
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
    });
  });
}


// unexpected exceptions
// i know that i should NOT use it
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException occurred.', err);
});

module.exports = app;
