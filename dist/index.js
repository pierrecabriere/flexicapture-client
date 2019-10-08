"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const faye_1 = __importDefault(require("faye"));
const paw_client_1 = __importDefault(require("paw-client"));
const client_1 = __importDefault(require("./client"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // liste des espaces tratés (cache)
        const processed = [];
        /*
        Fonction de traitement d'un sous-espace de travail plugandwork (document flexicapture)
        */
        const _processDocument = (sessionId, batchId, spaceId) => __awaiter(this, void 0, void 0, function* () {
            // On récupère les informations sur le document
            const { data: space } = yield pawClient.execute(`/api/d2/spaces/${spaceId}`, "get");
            console.log(`process paw document ${space.id}`);
            let type;
            if (space && space.attributes && space.attributes.family_id) {
                // On récupère le type de document (stocké dans la famille de celui-ci)
                const { data: family } = yield pawClient.execute(`/api/d2/families/${space.attributes.family_id}`, "get");
                type = family && family.attributes && family.attributes.title;
            }
            // On créé un nouveau document flexicapture avec les propriétés nécessaires à son traitement
            const flexicaptureDocument = new client_1.default.Document({
                BatchId: batchId,
                Properties: [
                    { Name: "kyc_id", Value: space.id },
                    { Name: "kyc_type", Value: type },
                ]
            });
            // On récupères les douments PaW de ce sous-espace (chaque document PaW correspondant
            // à un pièce flexicapture)
            const documents = yield pawClient.getDocs({ space_ids: [space.id] });
            // Pour chaque document
            yield Promise.all(documents.map((doc) => __awaiter(this, void 0, void 0, function* () {
                // Pour chaque page de ce document
                yield Promise.all(doc.attributes.pages_urls.map((page_url, index) => __awaiter(this, void 0, void 0, function* () {
                    // On récupère le contenu de la page que l'on enregistre dans un buffer
                    const data = yield pawClient.execute(page_url, "get", { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(data, 'binary').toString('base64');
                    // @ts-ignore - On créé un nouveau fichier flexicapture avec le buffer créé précédemment
                    const file = new client_1.default.File({ Name: `${doc.id}_page${index + 1}`, Bytes: buffer });
                    try {
                        // On ajoute le document à flexiapture
                        // /!\ Le paramètre excludeFromAutomaticAssembling est nécessaire au bon enregistrement des propriétés du document sur flexicapture
                        yield flexicaptureClient.call("AddNewDocument", { sessionId, file, document: flexicaptureDocument, previousItemId: 0, excludeFromAutomaticAssembling: true });
                    }
                    catch (e) {
                        console.log(e.response.data);
                    }
                    console.log(`added new image (flexicapture document) on batch ${batchId}`);
                })));
            })));
            // Le document a été traité
            console.log(`paw document ${space.id} processed`);
            return true;
        });
        /*
        Fonction de traitement d'un espace de travail plugandwork (dossier flexicapture).
        */
        const _processSpace = (spaceId) => __awaiter(this, void 0, void 0, function* () {
            // on récupère les informations sur l'espace
            const { data: space } = yield pawClient.execute(`/api/d2/spaces/${spaceId}`, "get");
            // on vérifie si l'espace a déjà été traité par ce script,
            // si c'est le cas, on stoppe l'exécution de cet espace
            if (processed.includes(space.id) || space.attributes.superfields.flexicaptureProcessed) {
                console.log("the script already processed this document");
                return;
            }
            else {
                processed.push(space.id);
                // Sinon, on patch l'espace pour indiquer qu'il a déjà été traité
                yield pawClient.execute(`/api/d2/spaces/${spaceId}`, "patch", {}, {
                    data: { attributes: { superfields: Object.assign({}, space.attributes.superfields, { flexicaptureProcessed: true }) } }
                });
            }
            // si cet espace n'a pas de sous-espaces (correspondants aux documents flexicapture),
            // on stoppe l'exécution de la fonction
            if (!space || !space.attributes || !space.attributes.space_ids) {
                console.log("no documents found");
                return;
            }
            console.log(`start space ${space.id}`);
            // On se connecte à flexicapture pour récupérer une session et ouvrir le projet configuré dans le .env
            const { userIdentity } = yield flexicaptureClient.call("GetCurrentUserIdentity");
            const { userId } = yield flexicaptureClient.call("FindUser", { userLogin: userIdentity.Name });
            const { sessionId } = yield flexicaptureClient.call("OpenSession", { roleType: 1, stationType: 1 });
            const { projectId } = yield flexicaptureClient.call("OpenProject", {
                sessionId,
                projectNameOrGuid: process.env.FLEXICAPTURE_PROJECT_GUID
            });
            console.log(`project ${projectId} opened`);
            let type = space && space.attributes && space.attributes.superfields && space.attributes.superfields.type || "";
            // On créé un nouveau batch avec les propriétés nécessaires au traitement du dossier
            const batch = new client_1.default.Batch({
                Name: space && space.attributes && space.attributes.title,
                ProjectId: projectId,
                Properties: [
                    { Name: "kyc_id", Value: spaceId },
                    { Name: "kyc_tpe", Value: type }
                ]
            });
            const { batchId } = yield flexicaptureClient.call("AddNewBatch", { sessionId, projectId, batch, ownerId: userId });
            console.log(`batch ${batchId} created for space ${spaceId}`);
            try {
                yield flexicaptureClient.call("OpenBatch", { sessionId, batchId });
            }
            catch (_a) {
                console.log("error opening batch");
            }
            console.log(`batch ${batchId} opened`);
            console.log(`${space.attributes.space_ids.length} paw document found`);
            // Pour chaque sous-espace de cet espace (c.a.d chaque document du dossier courant)
            yield space.attributes.space_ids.reduce((promise, space_id) => __awaiter(this, void 0, void 0, function* () {
                yield promise;
                // on traite le document
                yield _processDocument(sessionId, batchId, space_id);
            }), Promise.resolve());
            // On ferme le batch (nécessaire à son traitement) et on lance son exécution
            yield flexicaptureClient.call("CloseBatch", { sessionId, batchId });
            console.log(`batch ${batchId} closed`);
            yield flexicaptureClient.call("ProcessBatch", { sessionId, batchId });
            console.log(`batch ${batchId} created`);
            // On ferme le projet et la session
            yield flexicaptureClient.call("CloseProject", { sessionId, projectId });
            yield flexicaptureClient.call("CloseSession", { sessionId });
            console.log(`end space ${spaceId}`);
            // On réaffiche le message d'attente
            console.log("waiting for new space to process ...");
        });
        // Création du client Flexicapture qui servira à interagir avec le serveur flexicapture
        const flexicaptureClient = new client_1.default({
            host: process.env.FLEXICAPTURE_HOST,
            username: process.env.FLEXICAPTURE_USERNAME,
            password: process.env.FLEXICAPTURE_PASSWORD
        });
        // Création du client Plugandwork qui servira à interagir avec le serveur PaW
        const pawClient = new paw_client_1.default({
            host: process.env.PAW_HOST,
            credentials: {
                username: process.env.PAW_USERNAME,
                password: process.env.PAW_PASSWORD
            }
        });
        // Création du client Faye qui servira à se connecter au socket PaW (chargement dess dossiers en temps réel)
        const fayeClient = new faye_1.default.Client(`${process.env.PAW_HOST}/faye`);
        // quand le socket est connecté ...
        fayeClient.on('transport:up', function () {
            console.log("waiting for new space to process ...");
        });
        // on écoute sur le channel "/logs/users" en attente d'un code "flexicapture"
        fayeClient.subscribe('/logs/users', ({ code, log_id }) => __awaiter(this, void 0, void 0, function* () {
            if (code !== "flexicapture") {
                return;
            }
            // connexion à PaW
            yield pawClient.login();
            // on récupère l'espace concerné par la notification recue sur le channel
            const { data: { attributes: { action: space_id } } } = yield pawClient.execute(`/api/d2/logs/${log_id}`, "get");
            if (!space_id) {
                console.log("space_id not found in action");
                return;
            }
            // on traite l'espace (dossier flexicapture)
            _processSpace(space_id);
        }));
    });
}
main();
