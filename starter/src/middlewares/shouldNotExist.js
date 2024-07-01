const _ = require("lodash");
const db = require("db");

module.exports = (
  resourceName,
  { criteria = (ctx) => ({ name: ctx.validatedData.name }) } = {}
) => {
  return async (ctx, next) => {
    const doc = await db.services[resourceName].findOne(criteria(ctx));

    if (doc) {
      ctx.throw(400, {
        message: `${_.capitalize(resourceName)} already exists`,
      });
    } else {
      await next();
    }
  };
};
