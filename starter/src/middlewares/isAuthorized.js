import attachUser from './attachUser';

export default async (ctx, next) => {
  if (ctx.state.isSkipAuth) {
    ctx.state.user = null;
    return next();
  }

  await attachUser(ctx, async () => {
    if (ctx.state.user) {
      return next();
    }

    ctx.status = 401;
    ctx.body = {};
    return null;
  });
};