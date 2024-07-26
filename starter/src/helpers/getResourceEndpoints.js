import fs from 'fs';
import _ from 'lodash';

const {
  promises: { readdir },
} = fs;

export default async (resourceName) => {
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

  return endpointFiles.map(({ name, isHiveEndpoint }) => ({
    file: isHiveEndpoint ?  `${process.env.HIVE_SRC}/resources/${resourceName}/endpoints/${name}`: `${__dirname}/../resources/${resourceName}/endpoints/${name}`,
    name: _.last(name.split("/")).replace(".js", ""),
  }));

};
