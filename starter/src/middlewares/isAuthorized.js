const userService = require('db').services.users;
const tokenService = require('db').services.tokens;

const storeTokenToState = async (ctx) => {
  let accessToken = ctx.cookies.get('access_token');

  const { authorization } = ctx.headers;

  if (!accessToken && authorization) {
    accessToken = authorization.replace('Bearer', '').trim();
  }

  ctx.state.accessToken = accessToken;
};

module.exports = async (ctx, next) => {
  storeTokenToState(ctx);

  let token;

  if (ctx.state.accessToken) {
    token = await tokenService.findOne({ token: ctx.state.accessToken });
  }

  if (token) {
    ctx.state.user = await userService.findOne({ _id: token.user._id });
  }

  if (ctx.state.user) {
    return next();
  }

  ctx.status = 401;
  ctx.body = {};
  return null;
};