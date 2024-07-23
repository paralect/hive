import _ from "lodash";
import db from "db";
import schemaMappings from "./schemaMappings.js";
const schemaMappingService = db.services.schemaMappings;
const getDependentFields = (schema, dependentFieldName) => {
  let targetSchema = schema[dependentFieldName];
  if (targetSchema.type === "array") {
    targetSchema = targetSchema.items[0];
  }
  return Object.keys(targetSchema.keys).filter(
    (key) => !_.includes(["_id", "createdOn", "updatedOn"], key)
  );
};
const joiSchemaToSchemaMappings = () => {
  const newSchemaMappings = {};
  Object.keys(schemaMappings).forEach((schemaName) => {
    const schema = db.schemas[schemaName].describe().keys;
    newSchemaMappings[schemaName] = {};
    Object.keys(schemaMappings[schemaName]).forEach((fieldName) => {
      newSchemaMappings[schemaName][fieldName] = {
        schema: schemaMappings[schemaName][fieldName].schema,
        fields: getDependentFields(schema, fieldName),
      };
    });
  });
  return newSchemaMappings;
};
export default async () => {
  const prevSchema = await schemaMappingService.findOne({});
  const prevSchemaMappings = prevSchema?.mappings;
  if (!prevSchemaMappings) {
    const initialSchemaMappings = joiSchemaToSchemaMappings();
    schemaMappingService.create({ mappings: initialSchemaMappings });
  } else {
    const schemaNames = Object.keys(schemaMappings);
    await Promise.all(
      schemaNames.map(async (schemaName) => {
        const schema = db.schemas[schemaName].describe().keys;
        const fieldNames = Object.keys(schemaMappings[schemaName]);
        await Promise.all(
          fieldNames.map(async (fieldName) => {
            const dependentFields = getDependentFields(schema, fieldName);
            const prevSchema = (prevSchemaMappings[schemaName] &&
              prevSchemaMappings[schemaName][fieldName]) || { fields: [] };
            const { fields: prevDependentFields } = prevSchema;
            if (
              _.difference(dependentFields, prevDependentFields).length !== 0
            ) {
              console.log(`Mapping schema changes: ${schemaName}.${fieldName}`);
              const uniqueDependentEntityIds = await db.services[
                schemaName
              ].distinct(`${fieldName}._id`);
              const { results: uniqueDependentEntities } = await db.services[
                schemaMappings[schemaName][fieldName].schema
              ].find(
                {
                  _id: { $in: uniqueDependentEntityIds },
                },
                { fields: ["_id", ...dependentFields] }
              );
              await Promise.all(
                uniqueDependentEntities.map(async (entity) => {
                  if (schema[fieldName].type === "array") {
                    await db.services[schemaName].atomic.update(
                      { [`${fieldName}._id`]: entity._id },
                      {
                        $set: { [`${fieldName}.$`]: entity },
                      }
                    );
                  } else {
                    await db.services[schemaName].atomic.update(
                      { [`${fieldName}._id`]: entity._id },
                      {
                        $set: { [`${fieldName}`]: entity },
                      }
                    );
                  }
                })
              );
            }
          })
        );
      })
    );
    schemaMappingService.atomic.update(
      { _id: prevSchema._id },
      { $set: { mappings: joiSchemaToSchemaMappings() } }
    );
  }
};
