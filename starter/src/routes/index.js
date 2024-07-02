const _ = require("lodash");

const getResources = require("helpers/getResources");
const getResourceEndpoints = require("helpers/getResourceEndpoints");

const mount = require("koa-mount");
const Router = require("@koa/router");
const validate = require("middlewares/validate");

const requestLogService = require("db").createService("_request_logs");

const tryToAttachUser = require("middlewares/global/tryToAttachUser");

const attachCustomErrors = require("./middlewares/attachCustomErrors");
const routeErrorHandler = require("./middlewares/routeErrorHandler");

const logRequestToMongo = async (ctx, next) => {
  const startedOn = new Date();

  const saveLog = async ({ error = null } = {}) => {
    if (ctx.state.resourceName && ctx.state.endpoint) {
      const requestLog = {
        isSuccess: true,

        request: {
          url: ctx.originalUrl,
          method: ctx.request.method,

          query: ctx.query,
          body: ctx.request.body,
          params: ctx.params,
          headers: ctx.headers,
        },

        response: {
          status: ctx.status,
          body: ctx.body,
        },

        resourceName: ctx.state.resourceName,
        endpoint: ctx.state.endpoint,

        time: new Date() - startedOn,
      };

      if (error) {
        requestLog.isSuccess = false;

        requestLog.error = {
          message: error.message,
          stack: error.stack,
        };
      }

      await requestLogService.create(requestLog);
    }
  };

  try {
    await next();
    await saveLog({ error: ctx.state.error });
  } catch (err) {
    await saveLog({ error: err });

    throw err;
  }
};

const defineRoutes = async (app) => {
  app.use(logRequestToMongo);
  app.use(attachCustomErrors);
  app.use(routeErrorHandler);

  app.use(tryToAttachUser);

  const resources = await getResources();
  console.log('resources', resources)
  _.each(resources, async ({ name: resourceName }) => {
    const resourceRouter = new Router();
    const globalRouter = new Router();

    const endpoints = (await getResourceEndpoints(resourceName))
      .map(({ file: endpointFile, name }) => {
        const {
          endpoint = { method: 'get', url: '/' },
          requestSchema,
          middlewares = [],
          handler,
        } = require(endpointFile);

        endpoint.name = name;

        return {
          endpoint,
          requestSchema,
          middlewares,
          handler,
        };
      })
      .sort((e) => {
        e.endpoint = e.endpoint || { method: 'get', url: '/' };

        const url = e.endpoint.url || e.endpoint.absoluteUrl;

        if (url.includes("/:")) {
          return 1;
        }
        return -1;
      });


    endpoints.forEach(({ endpoint, requestSchema, middlewares, handler }) => {
      const additionalMiddlewares = [];

      if (requestSchema) {
        additionalMiddlewares.push(validate(requestSchema));
      }

      let targetRouter;
      let url = endpoint.absoluteUrl || endpoint.url;

      if (url.startsWith("$HOST/")) {
        url = url.replace("$HOST", "");
        targetRouter = globalRouter;
      } else if (endpoint.absoluteUrl) {
        targetRouter = globalRouter;
      } else {
        targetRouter = resourceRouter;
      }

      targetRouter[endpoint.method?.toLowerCase() || "get"](
        url,
        async (ctx, next) => {
          ctx.state.resourceName = resourceName;
          ctx.state.endpoint = endpoint;

          await next();
        },
        ...additionalMiddlewares,
        ...middlewares,
        handler
      );
    });

    app.use(globalRouter.routes());

    app.use(mount(`/${resourceName}`, resourceRouter.routes()));
  });
};

module.exports = defineRoutes;
