const db = require("db");

module.exports = (
  resourceName,
  { criteria = (ctx) => ({ _id: ctx.params[`${resourceName}Id`] }) } = {}
) => {
  return async (ctx, next) => {
    const doc = await db.services[resourceName].findOne(criteria(ctx));
    ctx.state[resourceName] = doc;

    if (!doc) {
      ctx.throw(404, { message: `${resourceName} not found` });
    } else {
      await next();
    }
  };
};
