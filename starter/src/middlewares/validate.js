import Joi from "joi";
function formatError(joiError) {
  const errors = {};
  joiError.details.forEach((error) => {
    const key = error.path.join(".");
    errors[key] = errors[key] || [];
    errors[key].push(error.message);
  });
  return errors;
}
function validate(schema) {
  return async (ctx, next) => {
    if (!schema.validate) {
      schema = Joi.object(schema);
    }
    const { value, error } = await schema.validate(
      {
        ...ctx.request.body,
        ...ctx.query,
      },
      {
        abortEarly: false,
        allowUnknown: true,
      }
    );
    if (error) ctx.throw(400, { errors: formatError(error) });
    ctx.validatedData = value;
    await next();
  };
}
export default validate;
