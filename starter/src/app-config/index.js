const fs = require('fs');

require("dotenv").config({ path: `${__dirname}/.env` });
require("dotenv").config({ path: `${__dirname}/.env.app` });

if (process.env.HIVE_SRC) {
  require("dotenv").config({ path: `${process.env.HIVE_SRC}/app-config/.env` });
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
  domain: env === 'production' ? 'https://api.yourapp.com': process.env.DOMAIN || '',
  isDev: env === "development",

  mongoUri: process.env.MONGODB_URI,

  redis: {
    url: process.env.REDIS_URI,
  },

  smtp: {
    fromEmail: process.env.SMTP_FROM_EMAIL,
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_KEY,
    },
  },

  ...appConfig,

  assert(configKey) {
    if (!config[configKey]) {
      throw Error(`Config [${configKey}] is missing`);
    }
  },
};

module.exports = config;

