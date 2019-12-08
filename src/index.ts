require('dotenv').config();

import Clients from "./services/Clients";
import Utils from "./services/Utils";
import Logger from "./services/Logger";

async function main() {
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
      await Utils.processSpace({
        spaceId: space_id
      });
    } catch (e) {
      Logger.error(`[${ new Date() }] error processing space ${ e }`, e)
    }
  });
}

main();