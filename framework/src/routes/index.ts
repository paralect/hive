import _ from "lodash";
import getResources from "helpers/getResources";
import getMiddlewares from "helpers/getMiddlewares";
import getResourceEndpoints from "helpers/getResourceEndpoints";
import mount from "koa-mount";
import Router from "@koa/router";
import validate from "middlewares/validate";
import db from "db";
import extractUserTokens from "middlewares/global/extractUserTokens";
import attachCustomErrors from "./middlewares/attachCustomErrors";
import routeErrorHandler from "./middlewares/routeErrorHandler";
import config from 'config';

const requestLogService = db.createService("_request_logs");

const logRequestToMongo = async (ctx, next) => {
  const startedOn = new Date();

  const saveLog = async ({ error = null } = {}) => {
    if (ctx.state.isSkipLog) {
      return;
    }

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

export default async (app) => {
  app.use(logRequestToMongo);
  app.use(attachCustomErrors);
  app.use(routeErrorHandler);
  app.use(extractUserTokens);

  const [resources, allMiddlewares] = await Promise.all([getResources(), getMiddlewares()]);

  await Promise.all(_.map(resources, async ({ name: resourceName }) => {
    const resourceRouter = new Router();
    const globalRouter = new Router();
    const endpoints = (await Promise.all((await getResourceEndpoints(resourceName))
      .map(async ({ file: endpointFile, name }) => {
        let endpointDef = (await import(endpointFile));

        if (endpointDef.default?.endpoint && endpointDef.default?.handler) {
          endpointDef = endpointDef.default;
        }

        if (!endpointDef.endpoint || !endpointDef.handler) {
          return null;
        }
        endpointDef.endpoint.name = name;

        return {
          endpoint: endpointDef.endpoint,
          requestSchema: endpointDef.requestSchema,
          middlewares: endpointDef.middlewares,
          handler: endpointDef.handler,
        };
      })))
      .filter(Boolean)
      .sort((a, b) => {
        const urlA = a.endpoint.url || a.endpoint.absoluteUrl || '/';
        const urlB = b.endpoint.url || b.endpoint.absoluteUrl || '/';
        return urlA.includes('/:') ? 1 : urlB.includes('/:') ? -1 : 0;
      });

    endpoints.forEach(({ endpoint, requestSchema, middlewares = [], handler }) => {
      let targetRouter;
      console.log('[routes] Register endpoint', resourceName, endpoint?.method || 'GET', endpoint?.url);

      let url = endpoint.absoluteUrl || endpoint.url;

      if (url.startsWith("$HOST/")) {
        url = url.replace("$HOST", "");
        targetRouter = globalRouter;
      } else if (endpoint.absoluteUrl) {
        targetRouter = globalRouter;
      } else {
        targetRouter = resourceRouter;
      }

      const globalMiddleware = allMiddlewares.find(m => m.name === 'global') || allMiddlewares.find(m => m.name === '_global');

      if (globalMiddleware) {
        globalMiddleware.runOrder = 0;
        middlewares.unshift(globalMiddleware.fn);
      }

      middlewares = middlewares.map(middleware => {
        if (_.isString(middleware)) {
          if (!allMiddlewares.find(m => m.name === middleware)) {
            throw new Error(`Middleware ${middleware} not found`);
          }

          middleware = allMiddlewares.find(m => m.name === middleware).fn;
        } else if (middleware?.name && middleware?.args) {
          if (!allMiddlewares.find(m => m.name === middleware.name)) {
            throw new Error(`Middleware ${middleware.name} not found`);
          };
          middleware = allMiddlewares.find(m => m.name === middleware.name).fn(...middleware.args);
        }

        return middleware;
      }).map(middleware => {
        middleware.runOrder = _.isNumber(middleware.runOrder) ? middleware.runOrder : 1;
        return middleware;
      });

      const routeMiddlewares = [
        async (ctx, next) => {
          ctx.state.resourceName = resourceName;
          ctx.state.endpoint = endpoint;
          await next();
        },
        ...(requestSchema ? [validate(requestSchema)] : []),
        ..._.sortBy(middlewares, m => m.runOrder),
        async ctx => {
          const result = await handler(ctx);

          if (!ctx.body) {
            ctx.body = result || { isOk: true };
          }
        }
      ];

      targetRouter[endpoint.method?.toLowerCase() || "get"](url, ...routeMiddlewares);
    });

    app.use(globalRouter.routes());
    app.use(mount(`/${resourceName}`, resourceRouter.routes()));
  }));
};