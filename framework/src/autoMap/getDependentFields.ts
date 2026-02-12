import _ from 'lodash';
import { z } from 'zod';
import isZodArray from "helpers/isZodArray";

const getZodKeys = schema => {
  // make sure schema is not null or undefined
  if (schema === null || schema === undefined) return [];
  // check if schema is nullable or optional
  if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional) return getZodKeys(schema.unwrap());
  // check if schema is an array
  if (isZodArray(schema)) return getZodKeys(schema.element);
  // check if schema is an object
  if (schema instanceof z.ZodObject) {
    // get key/value pairs from schema
    const entries = Object.entries(schema.shape);
    // loop through key/value pairs
    return entries.flatMap(([key, value]) => {
      // get nested keys
      const nested = value instanceof z.ZodType ? getZodKeys(value).map(subKey => `${key}.${subKey}`) : [];
      // return nested keys
      return nested.length ? nested : key;
    });
  }
  // return empty array
  return [];
};

export default (schema, dependentFieldName) => {
  let targetSchema = schema.shape[dependentFieldName];
  let zodKeys = getZodKeys(targetSchema);

  zodKeys = _.uniq(zodKeys.map(key => key.split('.')[0]));

  return zodKeys.filter(
    (key) => !_.includes(['_id', 'createdOn', 'updatedOn'], key)
  );
};