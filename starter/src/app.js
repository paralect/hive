import fs from "fs";
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
import routes from "routes";
import get from "resources/health/endpoints/get";
import "scheduler";

const main = async () => {
  await db.init();
  process.on("unhandledRejection", (reason, p) => {
    console.trace(reason.stack);
    logger.error(reason.stack);
  });
  const app = new Koa();
  app.use(cors({ credentials: true }));
  app.use(helmet());
  qs(app);
  app.use(bodyParser({ enableTypes: ["json", "form", "text"] }));
  app.use(mount("/health", get.handler));
  app.use(requestLogger());
  routes(app);
  const server = http.createServer(app.callback());
  server.listen(config.port, () => {
        console.log(`Api server listening on ${config.port}, in ${process.env.NODE_ENV} mode and ${process.env.APP_ENV} environment`);
  });
  await socketIo(server);
};
main();
export default main;
