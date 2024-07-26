import _ from "lodash";
import db from "db";
import ifUpdated from "helpers/db/ifUpdated";
import schemaMappings from "./schemaMappings.js";

const getDependentFields = (schema, dependentFieldName) => {
  let targetSchema = schema[dependentFieldName];
  if (targetSchema.type === "array") {
    [targetSchema] = targetSchema.items;
  }
  return Object.keys(targetSchema.keys).filter(
    (key) => !_.includes(["_id", "createdOn", "updatedOn"], key)
  );
};

const updatedSchemaMappings = (() => {
  const result = {};
  const schemaNames = Object.keys(schemaMappings);
  schemaNames.forEach((schemaName) => {
    const dependentFieldNames = Object.keys(schemaMappings[schemaName]);
    const schema = db.schemas[schemaName].describe().keys;
    dependentFieldNames.forEach((dependentFieldName) => {
      const dependentFields = getDependentFields(schema, dependentFieldName);
      if (!_.isEmpty(dependentFields)) {
        result[schemaName] = result[schemaName] || {};
        result[schemaName][dependentFieldName] = {
          schema: schemaMappings[schemaName][dependentFieldName].schema,
          dependentFields,
        };
      }
    });
  });
  return result;
})();

const getToUpdate = async ({ doc, schemaName }) => {
  const dependentFieldNames = Object.keys(updatedSchemaMappings[schemaName]);
  const toUpdate = {};
  await Promise.all(
    dependentFieldNames.map(async (dependentFieldName) => {
      const { schema: dependentSchemaName } =
        updatedSchemaMappings[schemaName][dependentFieldName];
      const { dependentFields } =
        updatedSchemaMappings[schemaName][dependentFieldName];
      if (!_.isEmpty(doc[dependentFieldName])) {
        if (_.isArray(doc[dependentFieldName])) {
          toUpdate[dependentFieldName] = (
            await db.services[dependentSchemaName].find(
              {
                _id: { $in: _.uniq(_.map(doc[dependentFieldName], "_id")) },
              },
              {
                fields: dependentFields,
              }
            )
          ).results;
        } else {
          toUpdate[dependentFieldName] = await db.services[
            dependentSchemaName
          ].findOne(
            {
              _id: doc[dependentFieldName]._id,
            },
            {
              fields: dependentFields,
            }
          );
        }
      }
    })
  );
  return toUpdate;
};

const populateOnCreate = ({ schemaName }) => {
  db.services[schemaName]._options.onBeforeCreated = async ({ docs }) => {
    const res = await Promise.all(
      docs.map(async (doc) => {
        const toUpdate = await getToUpdate({ schemaName, doc });
        return {
          ...doc,
          ...toUpdate,
        };
      })
    );
    return res;
  };
};

// const addOnEntityCreatedHandler = ({ schemaName }) => {
//   db.services[schemaName].on('created', async ({ doc }) => {
//     const toUpdate = await getToUpdate({ schemaName, doc });
//     if (!_.isEmpty(toUpdate)) {
//       await db.services[schemaName].atomic.update(
//         { _id: doc._id },
//         { $set: toUpdate }
//       );
//     }
//   });
// };

const addOnDependentEntitiesUpdatedHandlers = ({ schemaName }) => {
  const dependentFieldNames = Object.keys(schemaMappings[schemaName]);
  dependentFieldNames.forEach((dependentFieldName) => {
    const dependentFieldSchemaName =
      schemaMappings[schemaName][dependentFieldName].schema;
    const schema = db.schemas[schemaName].describe().keys;
    const dependentFields = getDependentFields(schema, dependentFieldName);
    db.services[dependentFieldSchemaName].on(
      "updated",
      ifUpdated(dependentFields, async ({ doc }) => {
        const toUpdate = _.pick(doc, ["_id", ...dependentFields]);
        if (schema[dependentFieldName].type === "array") {
          db.services[schemaName].atomic.update(
            { [`${dependentFieldName}._id`]: doc._id },
            {
              $set: {
                [`${dependentFieldName}.$`]: toUpdate,
              },
            }
          );
        } else {
          db.services[schemaName].atomic.update(
            { [`${dependentFieldName}._id`]: doc._id },
            {
              $set: {
                [`${dependentFieldName}`]: toUpdate,
              },
            }
          );
        }
      })
    );
  });
};
export default async () => {
  const schemaNames = Object.keys(updatedSchemaMappings);
  schemaNames.forEach((schemaName) => {
    // addOnEntityCreatedHandler({ schemaName });
    populateOnCreate({ schemaName });
    addOnDependentEntitiesUpdatedHandlers({ schemaName });
  });
};