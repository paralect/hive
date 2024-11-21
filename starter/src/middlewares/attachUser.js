
const middleware = async (ctx, next) => {
  ctx.state.isAllowAnonymous = true;
  return next();
};

middleware.runOrder = -1;

export default middleware;