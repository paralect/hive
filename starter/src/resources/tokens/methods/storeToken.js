import crypto from "crypto";
import util from "util";
import setCookie from "services/setCookie";
import db from "db";
const randomBytes = util.promisify(crypto.randomBytes, crypto);
const tokenService = db.services.tokens;
const generateSecureToken = async (tokenLength = 32) => {
  const buf = await randomBytes(tokenLength);
  return buf.toString("hex");
};
export default async (ctx, { userId }) => {
  const token = await generateSecureToken();
  const otp = await generateSecureToken();
  await tokenService.create({
    token,
    user: {
      _id: userId,
    },
    otp,
  });
  setCookie(ctx, { name: "access_token", value: token });
  return {
    token,
    otp,
  };
};
