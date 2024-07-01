const fs = require("fs");
const _ = require("lodash");

const {
  promises: { readdir },
} = fs;

module.exports = async (resourceName) => {
  console.log('get resource endpoint', resourceName);
  let isHiveEndpoint;
  
  if (fs.existsSync(`${__dirname}/../resources/${resourceName}/endpoints`) || (process.env.HIVE_SRC && (isHiveEndpoint = true) && fs.existsSync(`${process.env.HIVE_SRC}/resources/${resourceName}/endpoints`)) ) {
    const endpointFiles = await readdir(
      isHiveEndpoint ? 
      `${process.env.HIVE_SRC}/resources/${resourceName}/endpoints` :
      `${__dirname}/../resources/${resourceName}/endpoints`
    );

    return endpointFiles.map((f) => ({
      file: isHiveEndpoint ?  `${process.env.HIVE_SRC}/resources/${resourceName}/endpoints/${f}`: `${__dirname}/../resources/${resourceName}/endpoints/${f}`,
      name: _.last(f.split("/")).replace(".js", ""),
    }));
  }

  return [];
};
