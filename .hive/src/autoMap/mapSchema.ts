import _ from "lodash";
import db from "db";

import schemaMappings from "./schemaMappings";
import getDependentFields from './getDependentFields';
import isZodArray from "helpers/isZodArray";

const schemaMappingService = db.services.schemaMappings;

const zodSchemaToSchemaMappings = () => {
  const newSchemaMappings = {};

  Object.keys(schemaMappings).forEach((schemaName) => {
    const schema = db.schemas[schemaName];

    newSchemaMappings[schemaName] = {};

    Object.keys(schemaMappings[schemaName]).forEach((fieldName) => {
      newSchemaMappings[schemaName][fieldName] = {
        schema: schemaMappings[schemaName][fieldName].schema,
        fields: getDependentFields(schema, fieldName),
      };
    });
  });
  console.log('newSchemaMappings', newSchemaMappings)
  return newSchemaMappings;
};


export default async () => {
  const prevSchema = await schemaMappingService.findOne({});
  const prevSchemaMappings = prevSchema?.mappings;
  if (!prevSchemaMappings) {
    const initialSchemaMappings = zodSchemaToSchemaMappings();
    schemaMappingService.create({ mappings: initialSchemaMappings });
  } else {
    const schemaNames = Object.keys(schemaMappings);
    await Promise.all(
      schemaNames.map(async (schemaName) => {
        const schema = db.schemas[schemaName];

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
                  if (isZodArray(schema.shape[fieldName])) {
                    await db.services[schemaName].atomic.update(
                      { [`${fieldName}._id`]: entity._id },
                      {
                        $set: { [`${fieldName}.$`]: entity },
                      },
                      {
                        multi: true,
                      }
                    );
                  } else {
                    await db.services[schemaName].atomic.update(
                      { [`${fieldName}._id`]: entity._id },
                      {
                        $set: { [`${fieldName}`]: entity },
                      },
                      {
                        multi: true,
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
      { $set: { mappings: zodSchemaToSchemaMappings() } }
    );
  }
};