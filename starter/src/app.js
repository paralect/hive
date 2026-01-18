
import appModulePath from "app-module-path";
appModulePath.addPath(__dirname);

if (process.env.HIVE_SRC) {
  appModulePath.addPath(process.env.HIVE_SRC);
}

import Koa from "koa";
import http from "http";
import config from "app-config";
import logger from "logger";
import cors from "@koa/cors";
import helmet from "koa-helmet";
import qs from "koa-qs";
import bodyParser from "koa-bodyparser";

import requestLogger from "koa-logger";
import db from "db";
import socketIo from "socketIo";
import mount from "koa-mount";
import get from "resources/health/endpoints/get";

const main = async () => {
  await config.init();
  await db.init();

  const routes = (await import("routes")).default;
  const scheduler = (await import("./scheduler")).default;

  process.on("unhandledRejection", (reason, p) => {
    console.trace(reason.stack);
    logger.error(reason.stack);
  });

  const app = new Koa();

  app.use(cors({ credentials: true }));
  app.use(helmet());

  qs(app);

  app.use(bodyParser({
    enableTypes: ["json", "form", "text"],

    formLimit: config._hive.bodyParser?.formLimit || "10mb",
    textLimit: config._hive.bodyParser?.textLimit || "10mb",
    jsonLimit: config._hive.bodyParser?.jsonLimit || "10mb",
  }));

  app.use(mount("/health", get.handler));
  app.use(requestLogger());

  await routes(app);

  const server = http.createServer(app.callback());

  server.listen(config.port, () => {
    console.log(`Api server listening on ${config.port}, in ${process.env.NODE_ENV} mode and ${process.env.APP_ENV} environment`);
  });

  scheduler();

  await socketIo(server);
};

main();

export default main;