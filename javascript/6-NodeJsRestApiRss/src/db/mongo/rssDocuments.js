const mongoose = require('mongoose');
const logger = require('../../logger').getlogger('mongo.rssDocuments');

mongoose.Promise = global.Promise;
const db = require('./mongoConnection').connection;

const { Schema } = mongoose;
const rssDocumentSchema = Schema({
  rssLink: { type: Schema.Types.ObjectId, ref: 'rssLinks', index: true },
  title: { type: 'String' },
  link: { type: 'String' },
  guid: { type: 'String', index: true },
  description: { type: 'String' },
  publicationDate: { type: 'Date' },
}, { timestamps: true });
const RssDocument = db.model('rss_document', rssDocumentSchema);

function get(linkId) {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { rssLink: linkId };
      const data = await RssDocument.find(query);
      resolve(data);
    } catch (e) {
      logger.error('Exception!', e);
      reject(e);
    }
  });
}

function save(rssDocument) {
  return new Promise(async (resolve, reject) => {
    try {
      const newRssDocument = new RssDocument(rssDocument);
      await newRssDocument.save();
      resolve();
    } catch (e) {
      logger.error('Exception!', e);
      reject(e);
    }
  });
}

module.exports = {
  get,
  save,
};
