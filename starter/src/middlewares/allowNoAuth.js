
const middleware = async (ctx, next) => {
  ctx.state.isSkipAuth = true;
  return next();
};

middleware.runOrder = -1;

export default middleware;