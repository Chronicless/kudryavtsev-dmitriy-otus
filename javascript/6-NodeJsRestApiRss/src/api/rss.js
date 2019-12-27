const request = require('request-promise');
const xml = require('xml2js').parseString;

const db = require('../db');
const logger = require('../logger').getlogger('api.rss');

function getDataFromUrl(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const xmlData = await request(url).catch((err) => {
        logger.error(`Failed to get data from ${url}. Error : ${err}`);
        reject(err);
        throw err;
      });
      logger.debug('Data gathered from RSS link');
      xml(xmlData, async (err, jsonData) => {
        if (err) {
          logger.error(`Failed to parse body from the link as xml. Error :${err}`);
          reject(new Error('Not valid rss link'));
          return;
        }
        logger.debug(`Rss channel title : ${jsonData.rss.channel[0].title[0]}`);
        const rssLink = {
          title: jsonData.rss.channel[0].title[0],
          link: jsonData.rss.channel[0].link[0],
          description: jsonData.rss.channel[0].description[0],
          image: {
            url: jsonData.rss.channel[0].image[0].url[0],
            link: jsonData.rss.channel[0].image[0].link[0],
            title: jsonData.rss.channel[0].image[0].title[0],
          },
          lastBuildDate: jsonData.rss.channel[0].lastBuildDate[0],
        };
        // check if we already have this rss
        const dbData = await db.rssLinks.get(rssLink.link);
        if (dbData.length > 0) {
          // we already have this link in the database
          // no need to save it again
          resolve(dbData[0]._id);
          return;
        }
        const rssLinkId = await db.rssLinks.save(rssLink);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < jsonData.rss.channel[0].item.length; i++) {
          const item = jsonData.rss.channel[0].item[i];
          const rssElement = {
            title: item.title[0],
            link: item.link[0],
            guid: typeof item.guid[0] === 'object' ? item.guid[0]._ : item.guid[0],
            description: item.description[0],
            pubDate: item.pubDate[0],
            rssLink: rssLinkId,
          };
          // eslint-disable-next-line no-await-in-loop
          await db.rssDocuments.save(rssElement);
        }
        resolve(rssLinkId);
      });
    } catch (e) {
      logger.error(`Exception!${e}`);
      reject(e);
    }
  });
}

function addUrlToUser(url, session) {
  return new Promise(async (resolve, reject) => {
    try {
      const rssLink = await getDataFromUrl(url).catch((err) => {
        throw err;
      });
      // adding rss link to authenticated user
      if (rssLink) {
        await db.users.addRssLinkToUser(rssLink, session.userId)
          .then(resolve)
          .catch(reject);
      } else {
        reject(new Error('Not valid rss link'));
      }
    } catch (e) {
      logger.error('Exception!', e.message);
      reject(e.message);
    }
  });
}

function removeUrlFromUser(linkId, session) {
  return new Promise(async (resolve, reject) => {
    if (linkId) {
      await db.users.removeRssLinkFromUser(linkId, session.userId).catch(reject);
      resolve();
    } else {
      reject(new Error('Not valid rss link'));
    }
  });
}

function getUserLinks(session) {
  return new Promise(async (resolve, reject) => {
    const userSubIds = await db.users.getUserRssLinks(session.userId).catch(reject);
    resolve(userSubIds);
  });
}

function getLinkDataByIds(rssIds) {
  return new Promise((resolve, reject) => {
    db.rssLinks.getByIds(rssIds).then(resolve).catch(reject);
  });
}

function getLinkContent(rssId) {
  return new Promise(async (resolve, reject) => {
    const linkData = await getLinkDataByIds(rssId).catch(reject);
    const linkContent = await db.rssDocuments.get(rssId).catch(reject);
    resolve({ linkData, linkContent });
  });
}

module.exports = {
  addUrlToUser,
  removeUrlFromUser,
  getLinkDataByIds,
  getUserLinks,
  getLinkContent,
};
