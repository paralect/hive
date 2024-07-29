import _ from 'lodash';
import fs, { promises } from "fs";
import getResources from "./getResources.js";

const {
  promises: { readdir },
} = { promises };


const getSchemas = async (resourceDir) => {
   return (await readdir(resourceDir))
      .filter((f) => f.includes("schema.js"))
      .filter((f) => !f.includes("extends.schema"))
      .map((f) => ({
        name: f.replace(".schema.js", ""),
        file: `${resourceDir}/${f}`,
        resourceName: _.last(resourceDir.split('/')),
        isHive: process.env.HIVE_SRC && resourceDir.includes(process.env.HIVE_SRC),
      }));
}

const getResourceSchemas = async (resourceName) => {
  let schemaFiles  = [];

  if (fs.existsSync(`${process.env.HIVE_SRC}/resources/${resourceName}`)) {
    schemaFiles = (await getSchemas(`${process.env.HIVE_SRC}/resources/${resourceName}`));
  } 
      
  if (fs.existsSync(`${__dirname}/../resources/${resourceName}`)) {
    schemaFiles = [...schemaFiles, ...(await getSchemas(`${__dirname}/../resources/${resourceName}`)).filter(schema => !schemaFiles.find(s => s.name === schema.name))];
  }

  return schemaFiles;
};

export default async () => {
  const resources = await getResources();
  let schemas = [];

  await Promise.all(
    resources.map(async ({ name: resourceName }) => {
      const resourceSchemas = await getResourceSchemas(resourceName);
      schemas.push(...resourceSchemas);
    })
  );

  console.log('schemas', schemas);

  return schemas;
};