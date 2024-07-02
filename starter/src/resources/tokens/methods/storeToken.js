const crypto = require('crypto');
const util = require('util');

const randomBytes = util.promisify(crypto.randomBytes, crypto);

const setCookie = require('services/setCookie');

const tokenService = require('db').services.tokens;

const generateSecureToken = async (tokenLength = 32) => {
  const buf = await randomBytes(tokenLength);
  return buf.toString('hex');
};

module.exports = async (ctx, { userId }) => {
  const token = await generateSecureToken();
  const otp = await generateSecureToken();

  await tokenService.create({
    token,
    user: {
      _id: userId,
    },
    otp,
  });

  setCookie(ctx, { name: 'access_token', value: token });

  return {
    token,
    otp,
  };
};