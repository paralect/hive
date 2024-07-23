import crypto from "crypto";
import bcrypt from "bcryptjs";
import util from "util";
const randomBytes = util.promisify(crypto.randomBytes, crypto);
const bcryptHash = util.promisify(bcrypt.hash, bcrypt);
const compare = util.promisify(bcrypt.compare, bcrypt);
export const generateSecureToken = async (tokenLength = 48) => {
  const buf = await randomBytes(tokenLength);
  return buf.toString("hex");
};
export const getHash = (text) => {
  return bcryptHash(text, 10);
};
export const compareTextWithHash = (text, hash) => {
  return compare(text, hash);
};
