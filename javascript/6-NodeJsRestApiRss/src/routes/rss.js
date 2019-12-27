const express = require('express');
const moment = require('moment');
const router = express.Router();
const api = require('../api');
const { nvl } = require('../helpers');
const logger = require('../logger').getlogger('routes.rss');


router.all('/:linkId',async (req,res) => {
  const params = {
    authenticated: !!nvl(req.session.auth),
    userStatus: nvl(req.session.userStatus),
  };
  if (req.method === 'GET') {
    const linkContent = await api.rss.getLinkContent(req.params.linkId)
      .catch((err) => { logger.error(`Returning result ${err}`); res.status(500).json({ error: err }); });
    res.render('pages/rssContent.ejs', { linkContent, params, moment });
  } else {
    res.status(405).json({ error: 'Method not supported' });
  }
});

router.all('/', async (req, res) => {
  logger.debug('Rss page with called %s request', req.method);
  const params = {
    authenticated: !!nvl(req.session.auth),
    userStatus: nvl(req.session.userStatus),
  };
  let rssLinks;
  switch (req.method) {
    case 'GET':
      // get rss list and render page

      rssLinks = await api.rss.getUserLinks(req.session)
        .catch((err) => { res.status(400).json({ error: err }); })
        .then(api.rss.getLinkDataByIds)
        .catch((err) => { res.status(400).json({ error: err }); });

      logger.debug(`Rss links: ${rssLinks}`);
      res.render('pages/rss.ejs', { rssLinks, params });
      break;
    case 'POST':
      // eslint-disable-next-line no-case-declarations
      const { url } = req.body;
      if (url && url.length > 0) {
        api.rss.addUrlToUser(url, req.session)
          .then(() => { res.status(200).json({ status: 'success' }); })
          .catch((err) => { logger.error(`Returning result ${err}`); res.status(500).json({ error: err }); });
      }
      break;
    case 'DELETE':
      // remove rss from user
      break;
    default:
      res.status(405).json({ error: 'Method not supported' });
  }
});


module.exports = router;
