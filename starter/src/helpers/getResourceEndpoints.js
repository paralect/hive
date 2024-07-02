const fs = require("fs");
const _ = require("lodash");

const {
  promises: { readdir },
} = fs;

module.exports = async (resourceName) => {
  let endpointFiles = [];
  
  if (fs.existsSync(`${process.env.HIVE_SRC}/resources/${resourceName}/endpoints`)) {
    endpointFiles = [...endpointFiles, ...(await readdir(
      `${process.env.HIVE_SRC}/resources/${resourceName}/endpoints` 
    )).map( f => ({ name: f, isHiveEndpoint: true}))];
  } 
      
  if (fs.existsSync(`${__dirname}/../resources/${resourceName}/endpoints`)) {
    endpointFiles = [...endpointFiles, ...(await readdir(
      `${__dirname}/../resources/${resourceName}/endpoints`
    )).map( f => ({ name: f }))];
  }

  console.log('endpointFiles', resourceName, endpointFiles);
  return endpointFiles.map(({ name, isHiveEndpoint }) => ({
    file: isHiveEndpoint ?  `${process.env.HIVE_SRC}/resources/${resourceName}/endpoints/${name}`: `${__dirname}/../resources/${resourceName}/endpoints/${name}`,
    name: _.last(name.split("/")).replace(".js", ""),
  }));

};
