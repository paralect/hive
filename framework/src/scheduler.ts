import path from 'path';
import fs from 'fs';
import moment from 'moment';
import schedule from 'node-schedule';
import requireDir from 'require-dir';

export default () => {
  const paths = [path.resolve(__dirname, './scheduler/handlers')];
  if (process.env.HIVE_SRC) {
    paths.push(path.resolve(process.env.HIVE_SRC, './scheduler/handlers'))
  }

  paths.forEach((pathName) => {
    if (fs.existsSync(pathName)) {
      requireDir(pathName, {
        mapValue: (handler, handlerName) => {
          console.log(
            `[scheduler] Registering handler ${handlerName} with cron ${handler.cron}`
          );

          schedule.scheduleJob(handler.cron, () => {
            console.log(
              `[scheduler] ${moment().format()} executing ${handlerName} with cron ${handler.cron
              }`
            );
            handler.handler();
          });
        },
      });
    }
  });
}
