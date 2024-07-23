import psl from "psl";
import url from "url";
import appConfig from "app-config";
const { env } = appConfig;
const { webUri } = appConfig;
let cookiesDomain;
if (webUri) {
  const parsedUrl = url.parse(webUri);
  const parsed = psl.parse(parsedUrl.hostname);
  cookiesDomain = parsed.domain;
}
export default (ctx, { name, value }, options = {}) => {
  ctx.cookies.set(name, value, {
    domain: "",
    expires: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
    httpOnly: false,
    ...options,
  });
};
