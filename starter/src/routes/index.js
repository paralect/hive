import _ from "lodash";
import getResources from "helpers/getResources";
import getMiddlewares from "helpers/getMiddlewares";
import getResourceEndpoints from "helpers/getResourceEndpoints";
import mount from "koa-mount";
import Router from "@koa/router";
import validate from "middlewares/validate";
import db from "db";
import tryToAttachUser from "middlewares/global/tryToAttachUser";
import attachCustomErrors from "./middlewares/attachCustomErrors";
import routeErrorHandler from "./middlewares/routeErrorHandler";
import isAuthorized from "middlewares/isAuthorized";
import config from 'app-config';

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
  app.use(tryToAttachUser);

  const [resources, allMiddlewares] = await Promise.all([getResources(), getMiddlewares()]);

  await Promise.all(_.map(resources, async ({ name: resourceName }) => {
    const resourceRouter = new Router();
    const globalRouter = new Router();
    const endpoints = await Promise.all((await getResourceEndpoints(resourceName))
      .map(async ({ file: endpointFile, name }) => {
        let endpointDef = (await import(endpointFile));

        if (!endpointDef.endpoint) {
          console.log('missing endpoint for', name);
        }
        endpointDef.endpoint.name = name;

        return {
          endpoint: endpointDef.endpoint,
          requestSchema: endpointDef.requestSchema,
          middlewares: endpointDef.middlewares,
          handler: endpointDef.handler,
        };
      })
      .sort((e) => {
        e.endpoint = e.endpoint || { method: "get", url: "/" };
        const url = e.endpoint.url || e.endpoint.absoluteUrl;
        if (url.includes("/:")) {
          return 1;
        }
        return -1;
      }));

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

      const globalMiddleware = allMiddlewares.find(m => m.name === 'global');

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


      if (config._hive.isRequireAuthAllEndpoints) {
        isAuthorized.runOrder = 0;
        middlewares.unshift(isAuthorized);
      }

      targetRouter[endpoint.method?.toLowerCase() || "get"](
        url,
        async (ctx, next) => {
          ctx.state.resourceName = resourceName;
          ctx.state.endpoint = endpoint;
          await next();
        },
        validate(requestSchema),
        ..._.sortBy(middlewares, m => m.runOrder),
        async ctx => {
          const result = await handler(ctx);

          if (!ctx.body) {
            ctx.body = result || { isOk: true };
          }
        }
      );
    });

    app.use(globalRouter.routes());
    app.use(mount(`/${resourceName}`, resourceRouter.routes()));
  }));
};