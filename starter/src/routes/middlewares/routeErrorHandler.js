import logger from 'logger';

const routeErrorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.log("Route Error", error, error.stack);

    const clientError = error.errors;
    const serverError = { global: error.message };

    const errors = clientError || serverError;

    logger.error(errors);

    if (serverError && (error.status === 500 || !error.status) && process.env.APP_ENV === "production") {
      serverError.global = "Something went wrong";
    }

    ctx.state.error = error;

    ctx.status = error.status || 500;
    ctx.body = { errors };
  }
};

export default routeErrorHandler;
