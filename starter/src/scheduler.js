import moment from "moment";
import schedule from "node-schedule";
import requireDir from "require-dir";
requireDir("scheduler/handlers", {
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
