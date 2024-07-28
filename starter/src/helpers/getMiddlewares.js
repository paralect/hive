import _ from 'lodash';
import path from 'path';
import fs from 'fs';

const {
  promises: { readdir },
} = fs;


const getFiles = async (source) => {
  return (await readdir(source, { withFileTypes: true }))
    .filter((file) => !file.isDirectory())
    .map((file) => ({ fileName: file.name }));
};

export default async () => {
  let middlewaresDirs = await getFiles(`${__dirname}/../middlewares`);

  if (process.env.HIVE_SRC) {
    let hiveMiddlewaresDirPath = `${process.env.HIVE_SRC}/middlewares`;

    if (fs.existsSync(hiveMiddlewaresDirPath)) {
      middlewaresDirs = _.uniqBy([...middlewaresDirs, ...((await getFiles(hiveMiddlewaresDirPath)).map(r => ({ fileName: r.fileName, isHive: true })))], r => r.fileName);
    }
  }

  return Promise.all(middlewaresDirs
    .map(({ fileName, isHive }) => ({
      filePath: isHive ? path.resolve(`${process.env.HIVE_SRC}/middlewares/${fileName}`) : path.resolve(`${__dirname}/../middlewares/${fileName}`),
      name: fileName.replace('.js', ''),
    })).map(async ({ filePath, name }) => {
      return {
        name,
        filePath,
        fn: (await import(filePath)).default,
      }
    }));
};
