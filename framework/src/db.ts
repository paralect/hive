import fs from "fs";
import _ from "lodash";
import getSchemas from "helpers/getSchemas";
import getResources from "helpers/getResources";
import importHandlers from "helpers/importHandlers";
import generateDbTypes from "helpers/generateDbTypes";
import config from "app-config";
import { connect } from "lib/node-mongo";
import type { DbServices } from "./_generated/db.types";
import type MongoService from "lib/node-mongo/src/mongo-service";

interface HiveDb {
  services: DbServices;
  schemas: Record<string, any>;
  init: () => Promise<void>;
  createService: (name: string, options?: any) => MongoService;
  [key: string]: any;
}

const db: HiveDb = connect(config.mongoUri, {}) as any;

db.services = {} as DbServices;
db.schemas = {};

db.init = async () => {
  const schemaPaths = await getSchemas();

  await Promise.all(_.map(
    schemaPaths,
    async ({ file: schemaFile, resourceName, name: schemaName }) => {
      let { default: schema, secureFields = [] } = (await import(schemaFile));

      if (process.env.HIVE_SRC) {
        let extendSchemaPath = [`${process.env.HIVE_SRC}/resources/${resourceName}/${schemaName}.extends.schema.ts`, `${process.env.HIVE_SRC}/resources/${resourceName}/${schemaName}.extends.schema.js`].find(p => fs.existsSync(p));
        if (extendSchemaPath) {
          let extendsSchema = (await import(extendSchemaPath)).default;
          schema = schema.append(extendsSchema);
        }
      }
      db.schemas[schemaName] = schema;

      db.services[schemaName] = db.createService(`${resourceName}`, {
        validate: (obj) => {
          return { value: schema.parse(obj) };
        },
        secureFields: secureFields,
      });
    }
  ));

  const resourcePaths = await getResources();

  setTimeout(() => {
    _.each(resourcePaths, ({ name }) => {
      importHandlers(name)
    });
  }, 0);

  if (process.env.NODE_ENV !== 'production') {
    generateDbTypes(schemaPaths);
  }

  (await import("autoMap/addHandlers")).default();
  (await import("autoMap/mapSchema")).default();
};

export default db;
