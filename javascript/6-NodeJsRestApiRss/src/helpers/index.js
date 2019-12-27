function nvl(obj) {
  if (obj === undefined || obj === null) {
    return '';
  }
  return obj;
}

function getIpFromRequest(req) {
  return req.headers['cf-connecting-ip'] || req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

module.exports = {
  nvl,
  getIpFromRequest,
};
