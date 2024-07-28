import _ from 'lodash';
import fs from "fs";
import dotenv from "dotenv";
import appConfig from "./app.js";

dotenv.config({ path: `${__dirname}/.env` });
dotenv.config({ path: `${__dirname}/.env.app` });

console.log('process.env.HIVE_SRC', process.env.HIVE_SRC)

if (process.env.HIVE_SRC) {
  dotenv.config({
    path: `${process.env.HIVE_SRC}/app-config/.env`,
  });

  dotenv.config({
    path: `${process.env.HIVE_SRC}/app-config/.env.app`,
  });
}

const env = process.env.APP_ENV || "development";

let config = {
 async init() {
  if (process.env.HIVE_SRC) {
    let pluginConfigPath = `${process.env.HIVE_SRC}/app-config/app.js`;

    if (fs.existsSync(pluginConfigPath)) {
      const { default: pluginConfig } = await (import(pluginConfigPath))
console.log('plugin config', pluginConfig);
_.extend(config, pluginConfig);

    }
  }

}, 
 _hive: {},
  env,
  port: process.env.PORT || 3001,
  domain:
    env === "production" ? "https://api.yourapp.com" : process.env.DOMAIN || "",
  isDev: env === "development",
  mongoUri: process.env.MONGODB_URI,
  redis: {
    url: process.env.REDIS_URI,
  },
  smtp: {
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: true,
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