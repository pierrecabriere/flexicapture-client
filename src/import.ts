require('dotenv').config();

import Clients from "./services/Clients";
import Utils from "./services/Utils";

const query = { family_id: "", responsible: "", percent: 10, "superfields.status": "pret_pour_saisie" };

async function main() {
  const spaces = await Clients.paw.getSpaces(query);
  console.log(`${spaces.length} spaces found for query ${JSON.stringify(query)}`);
  await spaces.reduce(async (promise, space) => {
    await promise;

    await Utils.processSpace({
      spaceId: space.id,
      projectsMapping: {
        "kyc_als_hestia_sub1_beneficiaire": "56c35116-0b93-4a87-8e51-19d28c9cbdba",
        "kyc_mj": "48968721-755e-4125-8564-b8f267ae14c5",
        "kyc_als_hestia_amo": "137defae-5f3d-4a42-93c2-381116d0b63b"
      }
    });
  }, Promise.resolve());
  console.log("end import");
}

main();