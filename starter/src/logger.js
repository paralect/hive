import winston from 'winston';
import config from 'app-config';
import fs from 'fs';

const colorizer = winston.format.colorize();

let appTransports = [];

if (process.env.HIVE_SRC) {
  if (fs.existsSync(`${process.env.HIVE_SRC}/app-config/logger.js`)) {
    try {
      appTransports = require(`${process.env.HIVE_SRC}/app-config/logger.js`).transports;
    } catch (error) {
      console.error('Error loading logger config', error);
    }
  }
}

const createConsoleLogger = () => {
  // eslint-disable-next-line new-cap
  const logger = new winston.createLogger({
    exitOnError: false,
    level: config.isDev ? "debug" : "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      config.isDev
        ? winston.format.printf((msg) =>
          colorizer.colorize(
            msg.level,
            `${msg.timestamp} - ${msg.level}: ${JSON.stringify(msg.message)}`
          )
        )
        : winston.format.json()
    ),
    transports: [new winston.transports.Console(), ...appTransports],
  });

  logger.debug("[logger] Configured console based logger");

  return logger;
};

export default createConsoleLogger();
