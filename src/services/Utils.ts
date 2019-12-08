import Database from "./Database";
import { PDFDocument } from "pdf-lib";
import FlexicaptureClient from "../client";
import Clients from "./Clients";
import Logger from "./Logger";

class Utils {
  /*
  Fonction de traitement d'un sous-espace de travail plugandwork (document flexicapture)
  */
  static async processDocument({ sessionId, batchId, spaceId }) {
    // On récupère les informations sur le document
    const { data: space } = await Clients.paw.execute(`/api/d2/spaces/${ spaceId }`, "get", { config: { timeout: 0 } });
    Logger.info(`[${ new Date() }] process paw document ${ space.id }`);
    let type;
    if (space && space.attributes && space.attributes.family_id) {
      // On récupère le type de document (stocké dans la famille de celui-ci)
      const { data: family } = await Clients.paw.execute(`/api/d2/families/${ space.attributes.family_id }`, "get", { config: { timeout: 0 } });
      type = family && family.attributes && family.attributes.title;
    }

    // On récupères les douments PaW de ce sous-espace (chaque document PaW correspondant
    // à un pièce flexicapture)
    const documents = await Clients.paw.getDocs({ space_ids: [space.id] });

    if (!documents.length || !documents.filter(doc => doc.attributes.file_url && (doc.attributes.content_type.includes("image") || doc.attributes.content_type.includes("pdf") || doc.attributes.preview_url)).length) {
      Logger.info(`[${ new Date() }] Document ${ space.id } is not valid`);

      // const invalidfiles = documents.filter(doc => !doc.attributes.file_url || (!doc.attributes.content_type.includes("image") && !doc.attributes.content_type.includes("pdf") && !doc.attributes.preview_url))
      // console.log(invalidfiles);
      await Clients.paw.execute(`/api/d2/spaces/${ spaceId }`, "patch", { config: { timeout: 0 } }, {
        data: { attributes: { superfields: { ...space.attributes.superfields, flexicapture: "pieces_non_conformes" } } }
      });

      return;
    }

    // On créé un nouveau document flexicapture avec les propriétés nécessaires à son traitement
    const flexicaptureDocument = new FlexicaptureClient.Document({
      BatchId: batchId,
      Properties: [
        { Name: "kyc_id", Value: space.id },
        { Name: "kyc_type", Value: type },
      ]
    });

    // On ajoute le document à flexicapture
    // /!\ Le paramètre excludeFromAutomaticAssembling est nécessaire au bon enregistrement des propriétés du document sur flexicapture
    const { documentId } = await Clients.flexicapture.call("AddNewDocument", {
      sessionId,
      document: flexicaptureDocument,
      file: new FlexicaptureClient.File({ Name: null, Bytes: null }),
      previousItemId: 0,
      excludeFromAutomaticAssembling: true
    });

    let pageIndex = 1;
    // Pour chaque document
    await documents.reduce(async (promise, doc) => {
      await promise;

      if (doc.attributes.file_url) {
        try {
          // On récupère le contenu du fichier que l'on enregistre dans un buffer
          let data;
          try {
            data = await Clients.paw.execute(doc.attributes.file_url, "get", { responseType: 'arraybuffer', config: { timeout: 0 } });
          } catch {
            // retry
            data = await Clients.paw.execute(doc.attributes.file_url, "get", { responseType: 'arraybuffer', config: { timeout: 0 } });
          }

          // Si le fichier est un pdf, on sépare les pages
          if (doc.attributes.content_type.includes("pdf")) {
            try {
              const pdfDoc = await PDFDocument.load(data);
              const pages = pdfDoc.getPages();
              //console.log("nbr page:", pages.length);
              // Pour chaque page
              await pages.reduce(async (promise, _, _index) => {
                await promise;
                const pdfPage = await PDFDocument.create();
                const [_page] = await pdfPage.copyPages(pdfDoc, [_index]);
                pdfPage.addPage(_page);
                const pdfData = await pdfPage.save();

                // @ts-ignore - On créé un nouveau fichier flexicapture avec le buffer créé précédemment
                const file = new FlexicaptureClient.File({ Name: `${ doc.id }_page${ pageIndex + _index }`, Bytes: Buffer.from(pdfData.buffer).toString('base64') });

                // @ts-ignore
                const page = new FlexicaptureClient.Page({ SourcePageNumber: pageIndex + _index });

                await Clients.flexicapture.call("AddNewPage", { sessionId, batchId, documentId, file, previousItemId: -1, page });
              }, Promise.resolve());

              pageIndex += pages.length;
            } catch {
              await Clients.paw.execute(`/api/d2/spaces/${ spaceId }`, "patch", { config: { timeout: 0 } }, {
                data: { attributes: { superfields: { ...space.attributes.superfields, flexicapture: "pieces_non_conformes" } } }
              });
            }
          } else {
            try {
              const buffer = Buffer.from(data, 'binary').toString('base64');

              // @ts-ignore - On créé un nouveau fichier flexicapture avec le buffer créé précédemment
              const file = new FlexicaptureClient.File({ Name: `${ doc.id }_page${ pageIndex }`, Bytes: buffer });

              // @ts-ignore
              const page = new FlexicaptureClient.Page({ SourcePageNumber: pageIndex });

              await Clients.flexicapture.call("AddNewPage", { sessionId, batchId, documentId, file, previousItemId: -1, page });

              Logger.info(`[${ new Date() }] added new file on batch ${ batchId }`);
            } catch {
              Logger.error(`[${ new Date() }] Problem adding file on batch ${ batchId } - document ${ documentId }`);
            }

            pageIndex++;
          }

        } catch (e) {
          Logger.error(`[${ new Date() }] error adding file from document ${ doc.id }`);
        }
      }
    }, Promise.resolve());

    // Le document a été traité
    Logger.info(`[${ new Date() }] paw document ${ space.id } processed`);
    return true;
  };

  /*
  Fonction de traitement d'un espace de travail plugandwork (dossier flexicapture).
  */
  static async processSpace({ spaceId, projectsMapping }) {
    await Database.initialize();

    if (await Database.isProcessed(spaceId)) {
      Logger.info(`[${ new Date() }] space ${ spaceId } already processed`);
    }

    // on récupère les informations sur l'espace
    const { data: space } = await Clients.paw.execute(`/api/d2/spaces/${ spaceId }`, "get", { config: { timeout: 0 } });

    // si cet espace n'a pas de sous-espaces (correspondants aux documents flexicapture),
    // on stoppe l'exécution de la fonction
    if (!space || !space.attributes || !space.attributes.space_ids) {
      Logger.info(`[${ new Date() }] no documents found for space ${ space.id }`);
      return;
    }

    Logger.info(`[${ new Date() }] start space ${ space.id }`);

    let type = space && space.attributes && space.attributes.superfields && space.attributes.superfields.type || "";

    const projectGuid = projectsMapping[type] || process.env.FLEXICAPTURE_PROJECT_GUID;

    // On se connecte à flexicapture pour récupérer une session et ouvrir le projet configuré dans le .env
    // const { userIdentity } = await Clients.flexicapture.call("GetCurrentUserIdentity");
    // const { userId } = await Clients.flexicapture.call("FindUser", { userLogin: userIdentity.Name });
    const { sessionId } = await Clients.flexicapture.call("OpenSession", { roleType: 1, stationType: 1 });
    const { projectId } = await Clients.flexicapture.call("OpenProject", {
      sessionId,
      projectNameOrGuid: projectGuid
    });
    Logger.info(`[${ new Date() }] project ${ projectId } opened`);

    // On créé un nouveau batch avec les propriétés nécessaires au traitement du dossier
    const batch = new FlexicaptureClient.Batch({
      Name: space && space.attributes && space.attributes.title,
      ProjectId: projectId,
      Properties: [
        { Name: "kyc_id", Value: spaceId },
        { Name: "kyc_tpe", Value: type }
      ]
    });

    const { batchId } = await Clients.flexicapture.call("AddNewBatch", { sessionId, projectId, batch, ownerId: 0 });
    Logger.info(`[${ new Date() }] batch ${ batchId } created for space ${ spaceId }`);
    try {
      await Clients.flexicapture.call("OpenBatch", { sessionId, batchId });
    } catch {
      Logger.error(`[${ new Date() }] error opening batch`);
    }
    Logger.info(`[${ new Date() }] batch ${ batchId } opened`);

    Logger.info(`[${ new Date() }] ${ space.attributes.space_ids.length } paw document found`);

    let spaceProcessed = false;
    let processed = 0;
    // Pour chaque sous-espace de cet espace (c.a.d chaque document du dossier courant)
    await Promise.all(space.attributes.space_ids.map(async space_id => {
      try {
        await Utils.processDocument({ sessionId, batchId, spaceId: space_id });
        spaceProcessed = true;
        processed++;
      } catch (e) {
        Logger.info(`[${ new Date() }] error processing document ${ space_id }`, e);
      }
    }));

    if (!processed) {
      Logger.info(`[${ new Date() }] no document processed - setting status "traitement_en_cours"`);
      await Clients.paw.execute(`/api/d2/spaces/${ spaceId }`, "patch", { config: { timeout: 0 } }, {
        data: { attributes: { superfields: { ...space.attributes.superfields, status: "traitement_en_cours" } } }
      });
    }

    // On ferme le batch (nécessaire à son traitement) et on lance son exécution
    await Clients.flexicapture.call("CloseBatch", { sessionId, batchId });
    Logger.info(`[${ new Date() }] batch ${ batchId } closed`);
    await Clients.flexicapture.call("ProcessBatch", { sessionId, batchId });
    Logger.info(`[${ new Date() }] batch ${ batchId } created`);

    // On ferme le projet et la session
    await Clients.flexicapture.call("CloseProject", { sessionId, projectId });
    await Clients.flexicapture.call("CloseSession", { sessionId });

    // Sinon, on patch l'espace pour indiquer qu'il a déjà été traité
    await Database.processed(spaceId);

    Logger.info(`[${ new Date() }] end space ${ spaceId }`);

    // On réaffiche le message d'attente
    Logger.info(`[${ new Date() }] waiting for new space to process ...`);
  };
}

export default Utils;