const path = require("path");
const fs = require("fs");

const {
  promises: { readdir },
} = fs;


const getDirectories = async (source) => {
  return (await readdir(source, { withFileTypes: true }))
    .filter((dir) => dir.isDirectory())
    .map((dir) => ({ dirName: dir.name }));
};

module.exports = async () => {
  let resourceDirs = await getDirectories(`${__dirname}/../resources`);

  if (process.env.HIVE_SRC) {
    let hiveResourcesDirPath = `${process.env.HIVE_SRC}/resources`;
   
    if (fs.existsSync(hiveResourcesDirPath)) {
      resourceDirs = [...resourceDirs, ...((await getDirectories(hiveResourcesDirPath)).map(r => ({ dirName: r.dirName, isHive: true })))]
    }
  }

  return resourceDirs
    .filter(({ dirName }) => dirName !== "health")
    .map(({ dirName, isHive }) => ({
      dir: isHive ? path.resolve(`${process.env.HIVE_SRC}/resources/${dirName}`) : path.resolve(`${__dirname}/../resources/${dirName}`),
      name: dirName,
    }));
};
