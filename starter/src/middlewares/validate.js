
const formatError = (zodError) => {
  const errors = {};

  zodError.issues.forEach((error) => {
    const key = error.path.join('.');

    if (!errors[key]) {
      errors[key] = [];
    }

    (errors[key]).push(error.message);
  });

  return errors;
};

const validate = (schema) => async (ctx, next) => {
  const result = await schema.passthrough().safeParseAsync({
    ...(ctx.request.body),
    ...ctx.query,
    ...ctx.params,
  });

  if (!result.success) ctx.throw(400, { clientErrors: formatError(result.error) });

  ctx.validatedData = result.data;

  await next();
};

export default validate;
