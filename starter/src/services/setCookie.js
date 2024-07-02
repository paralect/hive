const psl = require('psl');
const url = require('url');
const { env } = require('app-config');

const { webUri } = require('app-config');

let cookiesDomain;

if (webUri) {
  const parsedUrl = url.parse(webUri);
  const parsed = psl.parse(parsedUrl.hostname);
  cookiesDomain = parsed.domain;
}

module.exports = (ctx, { name, value }, options = {}) => {
  ctx.cookies.set(name, value, {
    domain: '',
    expires: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
    httpOnly: false,
    ...options,
  });
};