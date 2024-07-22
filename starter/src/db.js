const fs = require("fs");
const _ = require("lodash");
const requireDir = require("require-dir");

const getSchemas = require("helpers/getSchemas");
const getResources = require("helpers/getResources");

const config = require("app-config");

const bullMqBus = require("./bullMqBus");

const db = require("lib/node-mongo").connect(config.mongoUri);

db.services = {};
db.schemas = {};

db.init = async () => {
  const schemaPaths = await getSchemas();

  _.each(
    schemaPaths,
    ({ file: schemaFile, resourceName, name: schemaName }) => {
      let schema = require(schemaFile);
      
      if (process.env.HIVE_SRC) {
        let extendSchemaPath = `${process.env.HIVE_SRC}/resources/${resourceName}/${schemaName}.extends.schema.js`;
     
        if (fs.existsSync(extendSchemaPath)) {
          let extendsSchema = require(extendSchemaPath);

          schema = schema.append(extendsSchema);
          console.log('schema', schema);
        }
      }

      db.schemas[schemaName] = schema;

      db.services[schemaName] = db.createService(`${resourceName}`, {
        validate: (obj) => schema.validate(obj, { allowUnknown: true }),
        emitter: bullMqBus
      });
    }
  );

  const resourcePaths = await getResources();

  _.each(resourcePaths, ({ dir }) => {
    if (fs.existsSync(`${dir}/handlers`)) {
      requireDir(`${dir}/handlers`);
    }
  });

  const mapSchema = require("autoMap/mapSchema");
  await mapSchema();

  const addHandlers = require("autoMap/addHandlers");
  await addHandlers();
};

module.exports = db;
