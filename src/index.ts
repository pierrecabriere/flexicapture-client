require('dotenv').config();

import Faye from "faye";
import PawClient from "paw-client";
import FlexicaptureClient from "./client";

async function main() {
  // liste des espaces tratés (cache)
  const processed = [];

  /*
  Fonction de traitement d'un sous-espace de travail plugandwork (document flexicapture)
  */
  const _processDocument = async (sessionId, batchId, spaceId) => {
    // On récupère les informations sur le document
    const { data: space } = await pawClient.execute(`/api/d2/spaces/${ spaceId }`, "get");
    console.log(`process paw document ${ space.id }`);
    let type;
    if (space && space.attributes && space.attributes.family_id) {
      // On récupère le type de document (stocké dans la famille de celui-ci)
      const { data: family } = await pawClient.execute(`/api/d2/families/${ space.attributes.family_id }`, "get");
      type = family && family.attributes && family.attributes.title;
    }

    // On créé un nouveau document flexicapture avec les propriétés nécessaires à son traitement
    const flexicaptureDocument = new FlexicaptureClient.Document({
      BatchId: batchId,
      Properties: [
        { Name: "kyc_id", Value: space.id },
        { Name: "kyc_type", Value: type },
      ]
    });

    // On récupères les douments PaW de ce sous-espace (chaque document PaW correspondant
    // à un pièce flexicapture)
    const documents = await pawClient.getDocs({ space_ids: [space.id] });
    // Pour chaque document
    await Promise.all(documents.map(async doc => {
      // Pour chaque page de ce document
      await Promise.all(doc.attributes.pages_urls.map(async (page_url, index) => {
        // On récupère le contenu de la page que l'on enregistre dans un buffer
        const data = await pawClient.execute(page_url, "get", { responseType: 'arraybuffer' });
        const buffer = Buffer.from(data, 'binary').toString('base64');
        // @ts-ignore - On créé un nouveau fichier flexicapture avec le buffer créé précédemment
        const file = new FlexicaptureClient.File({ Name: `${ doc.id }_page${ index + 1 }`, Bytes: buffer });
        try {
          // On ajoute le document à flexiapture
          // /!\ Le paramètre excludeFromAutomaticAssembling est nécessaire au bon enregistrement des propriétés du document sur flexicapture
          await flexicaptureClient.call("AddNewDocument", { sessionId, file, document: flexicaptureDocument, previousItemId: 0, excludeFromAutomaticAssembling: true });
        } catch (e) {
          console.log(e.response.data);
        }
        console.log(`added new image (flexicapture document) on batch ${ batchId }`);
      }));
    }));

    // Le document a été traité
    console.log(`paw document ${ space.id } processed`);
    return true;
  };

  /*
  Fonction de traitement d'un espace de travail plugandwork (dossier flexicapture).
  */
  const _processSpace = async spaceId => {

    // on récupère les informations sur l'espace
    const { data: space } = await pawClient.execute(`/api/d2/spaces/${ spaceId }`, "get");
    // on vérifie si l'espace a déjà été traité par ce script,
    // si c'est le cas, on stoppe l'exécution de cet espace
    if (processed.includes(space.id) || space.attributes.superfields.flexicaptureProcessed) {
      console.log("the script already processed this document");
      return;
    } else {
      processed.push(space.id);
      // Sinon, on patch l'espace pour indiquer qu'il a déjà été traité
      await pawClient.execute(`/api/d2/spaces/${ spaceId }`, "patch", {}, {
        data: { attributes: { superfields: { ...space.attributes.superfields, flexicaptureProcessed: true } } }
      });
    }
    // si cet espace n'a pas de sous-espaces (correspondants aux documents flexicapture),
    // on stoppe l'exécution de la fonction
    if (!space || !space.attributes || !space.attributes.space_ids) {
      console.log("no documents found");
      return;
    }

    console.log(`start space ${ space.id }`);

    // On se connecte à flexicapture pour récupérer une session et ouvrir le projet configuré dans le .env
    const { userIdentity } = await flexicaptureClient.call("GetCurrentUserIdentity");
    const { userId } = await flexicaptureClient.call("FindUser", { userLogin: userIdentity.Name });
    const { sessionId } = await flexicaptureClient.call("OpenSession", { roleType: 1, stationType: 1 });
    const { projectId } = await flexicaptureClient.call("OpenProject", {
      sessionId,
      projectNameOrGuid: process.env.FLEXICAPTURE_PROJECT_GUID
    });
    console.log(`project ${ projectId } opened`);

    let type = space && space.attributes && space.attributes.superfields && space.attributes.superfields.type || "";

    // On créé un nouveau batch avec les propriétés nécessaires au traitement du dossier
    const batch = new FlexicaptureClient.Batch({
      Name: space && space.attributes && space.attributes.title,
      ProjectId: projectId,
      Properties: [
        { Name: "kyc_id", Value: spaceId },
        { Name: "kyc_tpe", Value: type }
      ]
    });

    const { batchId } = await flexicaptureClient.call("AddNewBatch", { sessionId, projectId, batch, ownerId: userId });
    console.log(`batch ${ batchId } created for space ${ spaceId }`);
    try {
      await flexicaptureClient.call("OpenBatch", { sessionId, batchId });
    } catch {
      console.log("error opening batch");
    }
    console.log(`batch ${ batchId } opened`);

    console.log(`${ space.attributes.space_ids.length } paw document found`);

    // Pour chaque sous-espace de cet espace (c.a.d chaque document du dossier courant)
    await space.attributes.space_ids.reduce(async (promise, space_id) => {
      await promise;

      // on traite le document
      await _processDocument(sessionId, batchId, space_id);
    }, Promise.resolve());

    // On ferme le batch (nécessaire à son traitement) et on lance son exécution
    await flexicaptureClient.call("CloseBatch", { sessionId, batchId });
    console.log(`batch ${ batchId } closed`);
    await flexicaptureClient.call("ProcessBatch", { sessionId, batchId });
    console.log(`batch ${ batchId } created`);

    // On ferme le projet et la session
    await flexicaptureClient.call("CloseProject", { sessionId, projectId });
    await flexicaptureClient.call("CloseSession", { sessionId });

    console.log(`end space ${ spaceId }`);

    // On réaffiche le message d'attente
    console.log("waiting for new space to process ...");
  };

  // Création du client Flexicapture qui servira à interagir avec le serveur flexicapture
  const flexicaptureClient = new FlexicaptureClient({
    host: process.env.FLEXICAPTURE_HOST,
    username: process.env.FLEXICAPTURE_USERNAME,
    password: process.env.FLEXICAPTURE_PASSWORD
  });

  // Création du client Plugandwork qui servira à interagir avec le serveur PaW
  const pawClient = new PawClient({
    host: process.env.PAW_HOST,
    credentials: {
      username: process.env.PAW_USERNAME,
      password: process.env.PAW_PASSWORD
    }
  });

  // Création du client Faye qui servira à se connecter au socket PaW (chargement dess dossiers en temps réel)
  const fayeClient = new Faye.Client(`${ process.env.PAW_HOST }/faye`);

  // quand le socket est connecté ...
  fayeClient.on('transport:up', function () {
    console.log("waiting for new space to process ...");
  });

  // on écoute sur le channel "/logs/users" en attente d'un code "flexicapture"
  fayeClient.subscribe('/logs/users', async ({ code, log_id }) => {
    if (code !== "flexicapture") {
      return;
    }

    // connexion à PaW
    await pawClient.login();

    // on récupère l'espace concerné par la notification recue sur le channel
    const { data: { attributes: { action: space_id } } } = await pawClient.execute(`/api/d2/logs/${ log_id }`, "get");

    if (!space_id) {
      console.log("space_id not found in action");
      return;
    }

    // on traite l'espace (dossier flexicapture)
    _processSpace(space_id);
  });
}

main();