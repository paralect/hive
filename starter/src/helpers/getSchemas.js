import { promises } from "fs";
import getResources from "./getResources.js";
const { promises: { readdir }, } = { promises };
export default async () => {
    const resources = await getResources();
    const schemas = [];
    await Promise.all(resources.map(async ({ dir: resourceDir, name: resourceName }) => {
        const resourceSchemas = (await readdir(resourceDir))
            .filter((f) => f.includes("schema.js"))
            .filter((f) => !f.includes("extends.schema"))
            .map((f) => ({
            file: `${resourceDir}/${f}`,
            resourceName,
            name: f.replace(".schema.js", ""),
        }));
        schemas.push(...resourceSchemas);
    }));
    return schemas;
};
