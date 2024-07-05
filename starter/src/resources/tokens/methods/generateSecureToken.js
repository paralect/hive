import crypto from "crypto";
import util from "util";
const randomBytes = util.promisify(crypto.randomBytes, crypto);
export default async (tokenLength = 32) => {
    const buf = await randomBytes(tokenLength);
    return buf.toString("hex");
};
