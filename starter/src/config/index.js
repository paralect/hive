require("dotenv").config({ path: `${__dirname}/.env` });
require("dotenv").config({ path: `${__dirname}/.env.app` });

const appConfig = require("./app");

const env = process.env.APP_ENV || "development";

const config = {
  env,
  port: process.env.PORT || 3001,
  isDev: env === "development",

  projectId: process.env.PROJECT_ID,

  mongoUri: process.env.MONGODB_URI,

  redis: {
    url: process.env.REDIS_URI,
  },

  ...appConfig,
};

module.exports = config;
