import fs from "fs";
import _ from "lodash";
import getSchemas from "helpers/getSchemas";
import getResources from "helpers/getResources";
import importHandlers from "helpers/importHandlers";
import config from "app-config";
import { connect } from "lib/node-mongo";

const db = connect(config.mongoUri);

db.services = {};
db.schemas = {};

db.init = async () => {
  const schemaPaths = await getSchemas();

  await Promise.all(_.map(
    schemaPaths,
    async ({ file: schemaFile, resourceName, name: schemaName }) => {
      let schema = (await import(schemaFile)).default;

      if (process.env.HIVE_SRC) {
        let extendSchemaPath = `${process.env.HIVE_SRC}/resources/${resourceName}/${schemaName}.extends.schema.js`;
        if (fs.existsSync(extendSchemaPath)) {
          let extendsSchema = (await import(extendSchemaPath)).default;
          schema = schema.append(extendsSchema);
        }
      }
      db.schemas[schemaName] = schema;
      db.services[schemaName] = db.createService(`${resourceName}`, {
        validate: (obj) => {
          return { value: schema.passthrough().parse(obj) };
        },
      });

    }
  ));

  const resourcePaths = await getResources();

  setTimeout(() => {
    _.each(resourcePaths, ({ name }) => {
      importHandlers(name)
    });
  }, 0);

  (await import("autoMap/addHandlers")).default();
  (await import("autoMap/mapSchema")).default();
};

export default db;