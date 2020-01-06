require('dotenv').config();

import Utils from "./services/Utils";
import fs from "fs";
import path from "path";

const mapFolderSync = (dir: string) => {
  let files = [];

  fs.readdirSync(dir).forEach(subPath => {
    const dirPath = path.join(dir, subPath);
    const stat = fs.statSync(dirPath);
    if (stat && stat.isDirectory())
      files = files.concat(mapFolderSync(dirPath));
    else
      files.push(dirPath);
  });

  return files;
};

const controllersPath = path.resolve(__dirname, '../queries');
const queries = mapFolderSync(controllersPath).filter(filePath => filePath.match(/\.json$/)).map(filePath => require(filePath));

queries.reduce(async (promise, query) => {
  await promise;

  return Utils.import({ query })
}, Promise.resolve());