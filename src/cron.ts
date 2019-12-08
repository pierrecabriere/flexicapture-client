import Utils from "./services/Utils";
import fs from "fs";
import path from "path";
import { CronJob } from "cron";

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

const controllersPath = path.resolve(__dirname, 'queries');
const queries = mapFolderSync(controllersPath).filter(filePath => filePath.match(/\.json$/)).map(filePath => require(filePath));

queries.forEach(query => {
  new CronJob('00 00 6 * * *', () => Utils.import({ query })).start();
  new CronJob('00 00 13 * * *', () => Utils.import({ query })).start();
});