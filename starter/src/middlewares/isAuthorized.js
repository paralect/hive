import db from 'db';
import config from 'app-config';

const userService = db.services.users;
const tokenService = db.services.tokens;

const storeTokenToState = async (ctx) => {
  let accessToken = ctx.cookies.get('access_token');

  const { authorization } = ctx.headers;

  if (!accessToken && authorization) {
    accessToken = authorization.replace('Bearer', '').trim();
  }

  if (!accessToken && config._hive.authHeaderName && ctx.headers[config._hive.authHeaderName]) {
    accessToken = ctx.headers[config._hive.authHeaderName];
  }

  ctx.state.accessToken = accessToken;
};

export default async (ctx, next) => {
  storeTokenToState(ctx);

  let token;

  if (ctx.state.isSkipAuth) {
    ctx.state.user = null;
    return next();
  }

  if (ctx.state.accessToken) {
    token = await tokenService.findOne({ token: ctx.state.accessToken });
  }

  if (token) {
    ctx.state.user = await userService.findOne({ _id: token.user._id });

    if (token.metadata) {
      ctx.state.user.authMetadata = token.metadata;
    }
  }

  if (ctx.state.user) {
    return next();
  }

  if (ctx.state.isAllowAnonymous) {
    return next();
  }

  ctx.status = 401;
  ctx.body = {};
  return null;
};