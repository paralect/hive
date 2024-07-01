const fs = require("fs");
const path = require("path");

// Function to create directories recursively
function mkdirRecursive(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Function to convert JSON schema to JavaScript code
function convertJsonToJs(schema) {
  let jsCode = "const Joi = require('joi');\n\n";
  jsCode += `const ${schema.name} = Joi.object({\n`;
  for (const [key, value] of Object.entries(schema.schema)) {
    if (typeof value === "object" && !Array.isArray(value)) {
      jsCode += `  ${key}: Joi.object({\n`;
      for (const [subKey, subValue] of Object.entries(value)) {
        jsCode += `    ${subKey}: ${subValue},\n`;
      }
      jsCode += `  }),\n`;
    } else {
      jsCode += `  ${key}: ${value},\n`;
    }
  }
  jsCode += "});\n\n";
  jsCode += `module.exports = ${schema.name};\n`;
  return jsCode;
}

// Function to generate endpoint code
function createEndpointCode(endpoint) {
  let requestSchema = "const Joi = require('joi');\n\n";
  requestSchema += "module.exports.requestSchema = Joi.object({\n";
  for (const [key, value] of Object.entries(endpoint.requestSchema)) {
    requestSchema += `  ${key}: ${value},\n`;
  }
  requestSchema += "});\n\n";

  return `
  ${endpoint.handler}

${requestSchema}
module.exports.endpoint = ${JSON.stringify(endpoint.endpoint, null, 2)};
`;
}

// Main function to generate the project structure
function generateProjectStructure(resources) {
  resources.forEach((resource) => {
    const resourceDir = path.join(__dirname, "src", "resources", resource.name);
    mkdirRecursive(resourceDir);

    // Create schemas directory and files
    if (resource.schemas) {
      const schemaDir = path.join(resourceDir);
      mkdirRecursive(schemaDir);
      resource.schemas.forEach((schema) => {
        const schemaCode = convertJsonToJs(schema);
        fs.writeFileSync(
          path.join(schemaDir, `${schema.name.toLowerCase()}.schema.js`),
          schemaCode
        );
      });
    }

    // Create endpoints directory and files
    if (resource.endpoints) {
      const endpointDir = path.join(resourceDir, "endpoints");
      mkdirRecursive(endpointDir);
      resource.endpoints.forEach((endpoint) => {
        const endpointCode = createEndpointCode(endpoint);
        fs.writeFileSync(
          path.join(endpointDir, `${endpoint.name}.js`),
          endpointCode
        );
      });
    }

    // Create handlers directory and files
    if (resource.handlers) {
      const handlerDir = path.join(resourceDir, "handlers");
      mkdirRecursive(handlerDir);
      resource.handlers.forEach((handler) => {
        const handlerCode = handler.handler;
        fs.writeFileSync(
          path.join(handlerDir, `${handler.name}.js`),
          handlerCode
        );
      });
    }

    // Create methods directory and files
    if (resource.methods) {
      const methodDir = path.join(resourceDir, "methods");
      mkdirRecursive(methodDir);
      resource.methods.forEach((method) => {
        const methodCode = method.handler;
        fs.writeFileSync(path.join(methodDir, `${method.name}.js`), methodCode);
      });
    }
  });
}

// Main entry point
const [, , jsonFilePath] = process.argv;

if (!jsonFilePath) {
  console.error("Please provide the path to the JSON file.");
  process.exit(1);
}

const rawData = fs.readFileSync(jsonFilePath, "utf8");
const { resources } = JSON.parse(rawData);

generateProjectStructure(resources);

console.log("Hive-based project structure generated successfully.");
