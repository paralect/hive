const moment = require("moment");
const schedule = require("node-schedule");

const requireDir = require("require-dir");

requireDir(`${process.HIVE_SRC || "."}/scheduler/handlers`, {
  mapValue: (handler, handlerName) => {
    console.log(
      `[scheduler] Registering handler ${handlerName} with cron ${handler.cron}`
    );

    schedule.scheduleJob(handler.cron, () => {
      console.log(
        `[scheduler] ${moment().format()} executing ${handlerName} with cron ${
          handler.cron
        }`
      );
      handler.handler();
    });
  },
});
