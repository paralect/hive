const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes, crypto);

module.exports = async (tokenLength = 32) => {
  const buf = await randomBytes(tokenLength);
  return buf.toString('hex');
};