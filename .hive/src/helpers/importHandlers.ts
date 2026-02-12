import fs from 'fs';
import _ from 'lodash';
import requireDir from "require-dir";

export default (resourceName) => {
  if (fs.existsSync(`${process.env.HIVE_SRC}/resources/${resourceName}/handlers`)) {
    requireDir(`${process.env.HIVE_SRC}/resources/${resourceName}/handlers`, {
      mapValue: (handler, handlerName) => {
        console.log(
          `[handlers] Registering handler ${handlerName}`
        );

        return handler;
      },
    });
  }

  if (fs.existsSync(`${__dirname}/../resources/${resourceName}/handlers`)) {
    requireDir(`${__dirname}/../resources/${resourceName}/handlers`, {
      mapValue: (handler, handlerName) => {
        console.log(
          `[handlers] Registering handler ${handlerName}`
        );

        return handler;
      },
    });
  }
};
