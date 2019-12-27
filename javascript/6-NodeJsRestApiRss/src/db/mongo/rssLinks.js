const mongoose = require('mongoose');
const moment = require('moment');
const logger = require('../../logger').getlogger('mongo.rssDocuments');

mongoose.Promise = global.Promise;
const db = require('./mongoConnection').connection;

const { Schema } = mongoose;
const rssLinkSchema = Schema({
  title: { type: 'String', index: true },
  link: { type: 'String' },
  description: { type: 'String' },
  lastBuildDate: { type: 'Date' },
  image: {
    url: { type: 'String' },
    link: { type: 'String' },
    title: { type: 'String' },
  },
}, { timestamps: true });

const RssLink = db.model('rss_link', rssLinkSchema);

function get(link) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { link };
      const data = await RssLink.find(query);
      resolve(data);
    } catch (e) {
      logger.error('Exception!', e);
      reject(e);
    }
  });
}

function getByIds(ids) {
  return new Promise(async (resolve, reject) => {
    const linkIds = typeof ids === 'object' && ids.length > 0 ? ids : [ids];
    const linkData = await RssLink.find({ _id: { $in: linkIds } })
      .catch((err) => {
        const msg = `Failed to get rss link data by id ${ids}. Error : ${err}`;
        logger.error(msg);
        reject(msg);
      });
    resolve(linkData);
  });
}

function save(rssLink) {
  return new Promise(async (resolve, reject) => {
    try {
      const newRssLink = new RssLink(rssLink);
      await newRssLink.save();
      // eslint-disable-next-line no-underscore-dangle
      resolve(newRssLink._id);
    } catch (e) {
      logger.error('Exception!', e);
      reject(e);
    }
  });
}

module.exports = {
  get,
  getByIds,
  save,
};
