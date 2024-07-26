import db from 'db';

function singularize(word) {
  const endings = {
    ves: 'fe',
    ies: 'y',
    i: 'us',
    zes: 'ze',
    ses: 's',
    es: 'e',
    s: '',
  };
  return word.replace(
    new RegExp(`(${Object.keys(endings).join('|')})$`),
    (r) => endings[r]
  );
}

export default (
  resourceName,
  {
    criteria = (ctx) => ({ _id: ctx.params[`${singularize(resourceName)}Id`] }),
    ctxName = resourceName,
  } = {}
) => {
  return async (ctx, next) => {
    const doc = await db.services[resourceName].findOne(criteria(ctx));
    ctx.state[ctxName] = doc;
    ctx.state[singularize(resourceName)] = doc;

    if (!doc) {
      ctx.throw(404, { message: `${resourceName} not found` });
    } else {
      await next();
    }
  };
};