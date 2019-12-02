require('dotenv').config();

import Clients from "./services/Clients";
import Utils from "./services/Utils";

// MJ
const query = {
  "family_id": "5ced18a1b289d537b6b71051",
  "responsible": "5d7ce507b289d507b8bee703",
  "superfields.status": "pret_pour_saisie",
  "percent_min": 10,
  "percent_max": 10
};

// AMO
// const query = {
//   "family_id": "5d6f5a15b289d56af4e127c6",
//   "responsible": "5d7cdf77b289d507adbeeba2",
//   "superfields.status": "pret_pour_saisie",
//   "percent_min": 10,
//   "percent_max": 10
// };

// MJ
// const query = {
//   "family_id": "5d4055b3b289d564eadbe69c",
//   "responsible": "5d7cdf77b289d507adbeeba2",
//   "superfields.status": "pret_pour_saisie",
//   "percent_min": 10,
//   "percent_max": 10
// };

const pageSize = 100;
const projectsMapping = {
  "kyc_als_hestia_sub1_beneficiaire": "56c35116-0b93-4a87-8e51-19d28c9cbdba",
  "kyc_mj": "48968721-755e-4125-8564-b8f267ae14c5",
  "kyc_als_hestia_amo": "137defae-5f3d-4a42-93c2-381116d0b63b"
};

async function processPage(spaces, page) {
  console.log(`Processing page ${page}`);
  await spaces.reduce(async (promise, space) => {
    await promise;

    await Utils.processSpace({
      spaceId: space.id,
      projectsMapping
    });
  }, Promise.resolve());
}

async function main() {
  await Clients.paw.login();
  const { data, meta } = await Clients.paw.execute(`/api/d2/spaces`, "get", {}, { ...query, per_page: pageSize, page: 1 });
  console.log(`${ meta.pagination.total_objects } spaces found for query ${ JSON.stringify(query) }`);
  await processPage(data, 1);
  // @ts-ignore
  const pages = parseInt(meta.pagination.total_objects / pageSize) - 1;

  if (pages > 1) {
    await Array(pages).fill(0).reduce(async (promise, _, page) => {
      await promise;
      await Clients.paw.login();

      const { data } = await Clients.paw.execute(`/api/d2/spaces`, "get", {}, { ...query, per_page: pageSize, page: page + 2 });
      await processPage(data, page + 2);
    }, Promise.resolve());
  }
  console.log("end import");
}

main();