import _ from "lodash";
import db from "db";
export default (
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
