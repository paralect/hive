import db from 'db';
import crypto from 'crypto';
import util from 'util';

const randomBytes = util.promisify(crypto.randomBytes, crypto);

import setCookie from 'services/setCookie';

const tokenService = db.services.tokens;

const generateSecureToken = async (tokenLength = 32) => {
  const buf = await randomBytes(tokenLength);
  return buf.toString('hex');
};

export default async (ctx, { userId, metadata = null }) => {
  const token = await generateSecureToken();
  const otp = await generateSecureToken();

  await tokenService.create({
    token,
    user: {
      _id: userId,
    },
    otp,
    ...(metadata ? { metadata } : {})
  });

  setCookie(ctx, { name: 'access_token', value: token });

  return {
    token,
    otp,
  };
};