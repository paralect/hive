const fs = require('fs');

require("dotenv").config({ path: `${__dirname}/.env` });
require("dotenv").config({ path: `${__dirname}/.env.app` });

if (process.env.HIVE_SRC) {
  require("dotenv").config({ path: `${process.env.HIVE_SRC}/app-config/.env.app` });
}

let appConfig = require("./app");

if (process.env.HIVE_SRC) {
  let pluginConfigPath = `${process.env.HIVE_SRC}/app-config/app.js`;

  if (fs.existsSync(pluginConfigPath)) {
    let pluginConfig = require(pluginConfigPath);
    appConfig = { ...appConfig, ...pluginConfig };
  }
}


const env = process.env.APP_ENV || "development";

const config = {
  env,
  port: process.env.PORT || 3001,
  isDev: env === "development",

  mongoUri: process.env.MONGODB_URI,

  redis: {
    url: process.env.REDIS_URI,
  },

  ...appConfig,

  assert(configKey) {
    if (!config[configKey]) {
      throw Error(`Config [${configKey}] is missing`);
    }
  },
};

module.exports = config;

