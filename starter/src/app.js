require("app-module-path").addPath(__dirname);

if (process.env.HIVE_SRC) {
  require("app-module-path").addPath(process.env.HIVE_SRC);
}

const fs = require("fs");

const Koa = require("koa");
const http = require("http");
const config = require("config");
const logger = require("logger");
const cors = require("@koa/cors");
const helmet = require("koa-helmet");
const qs = require("koa-qs");
const bodyParser = require("koa-bodyparser");
const requestLogger = require("koa-logger");
const db = require("db");

const socketIo = require("socketIo");
const mount = require("koa-mount");

const main = async () => {
  await db.init();

  const routes = require("routes");

  process.on("unhandledRejection", (reason, p) => {
    console.trace(reason.stack);

    logger.error(reason.stack);
  });

  const app = new Koa();

  app.use(cors({ credentials: true }));
  app.use(helmet());
  qs(app);
  app.use(bodyParser({ enableTypes: ["json", "form", "text"] }));

  app.use(mount("/health", require("resources/health/endpoints/get").handler));

  app.use(requestLogger());

  routes(app);

  const server = http.createServer(app.callback());
  server.listen(config.port, () => {
    console.log(
      `Api server listening on ${config.port}, in ${process.env.NODE_ENV} mode and ${process.env.APP_ENV} environment`
    );
  });

  await socketIo(server);

  require("scheduler");
};

main();

module.exports = main;
