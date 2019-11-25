require('dotenv').config();

import Clients from "./services/Clients";
import Utils from "./services/Utils";
import Logger from "./services/Logger";

async function main() {
  // liste des espaces tratés (cache)
  const processed = [];

  // quand le socket est connecté ...
  Clients.faye.on('transport:up', function () {
    Logger.info(`[${ new Date() }] waiting for new space to process ...`);
  });

  // on écoute sur le channel "/logs/users" en attente d'un code "flexicapture"
  Clients.faye.subscribe('/logs/users', async ({ code, log_id }) => {
    if (code !== "flexicapture") {
      return;
    }

    // connexion à PaW
    await Clients.paw.login();

    // on récupère l'espace concerné par la notification recue sur le channel
    const { data: { attributes: { action: space_id } } } = await Clients.paw.execute(`/api/d2/logs/${ log_id }`, "get", { config: { timeout: 0 } });

    if (!space_id) {
      Logger.info(`[${ new Date() }] space_id not found in action`);
      return;
    }

    // on traite l'espace (dossier flexicapture)
    try {
      // on vérifie si l'espace a déjà été traité par ce script,
      // si c'est le cas, on stoppe l'exécution de cet espace
      //if (processed.includes(space.id) || space.attributes.superfields.flexicaptureProcessed) {
      //  Logger.info(`[${ new Date() }] the script already processed this document`);
      //  return;
      //} else {
      processed.push(space_id);
      //}

      await Utils.processSpace({
        spaceId: space_id,
        projectsMapping: {
          "kyc_als_hestia_sub1_beneficiaire": "56c35116-0b93-4a87-8e51-19d28c9cbdba",
          "kyc_mj": "48968721-755e-4125-8564-b8f267ae14c5",
          "kyc_als_hestia_amo": "137defae-5f3d-4a42-93c2-381116d0b63b"
        }
      });
    } catch (e) {
      Logger.error(`[${ new Date() }] error processing space ${ e }`, e)
    }
  });
}

main();