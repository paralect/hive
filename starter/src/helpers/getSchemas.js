const {
  promises: { readdir },
} = require("fs");
const getResources = require("./getResources");

module.exports = async () => {
  const resources = await getResources();

  const schemas = [];

  await Promise.all(
    resources.map(async ({ dir: resourceDir, name: resourceName }) => {
      const resourceSchemas = (await readdir(resourceDir))
        .filter((f) => f.includes("schema.js"))
        .map((f) => ({
          file: `${resourceDir}/${f}`,
          resourceName,
          name: f.replace(".schema.js", ""),
        }));
      schemas.push(...resourceSchemas);
    })
  );

  return schemas;
};
