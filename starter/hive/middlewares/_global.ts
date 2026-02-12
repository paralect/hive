import isAuthorized from '@/middlewares/isAuthorized';

export default async (ctx, next) => {
  await isAuthorized(ctx, async () => {
    // await someOtherMiddleware(ctx, next);

    return next();
  });
};
