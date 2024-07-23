const storeTokenToState = async (ctx, next) => {
  let accessToken = ctx.cookies.get("ship_access_token");
  const { authorization } = ctx.headers;
  if (!accessToken && authorization) {
    accessToken = authorization.replace("Bearer", "").trim();
  }
  ctx.state.accessToken = accessToken;
  await next();
};
export default storeTokenToState;
