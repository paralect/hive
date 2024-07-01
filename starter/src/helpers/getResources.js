const {
  promises: { readdir },
} = require("fs");
const path = require("path");

const getDirectories = async (source) => {
  return (await readdir(source, { withFileTypes: true }))
    .filter((dir) => dir.isDirectory())
    .map((dir) => ({ dirName: dir.name }));
};

module.exports = async () => {
  let resourceDirs = await getDirectories(`${__dirname}/../resources`);

  if (process.env.HIVE_SRC) {
    resourceDirs = [...resourceDirs, ...((await getDirectories(`${process.env.HIVE_SRC}/resources`)).map(r => ({ dirName: r.dirName, isHive: true })))]
  }

  return resourceDirs
    .filter(({ dirName }) => dirName !== "health")
    .map(({ dirName, isHive }) => ({
      dir: isHive ? path.resolve(`${process.env.HIVE_SRC}/resources/${dirName}`) : path.resolve(`${__dirname}/../resources/${dirName}`),
      name: dirName,
    }));
};
