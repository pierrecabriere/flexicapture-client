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
        const _processSpace = (projectId, sessionId, userId, parentId, spaceId) => __awaiter(this, void 0, void 0, function* () {
            console.log(`process item ${spaceId}`);
            const { data: space } = yield pawClient.execute(`/api/d2/spaces/${spaceId}`, "get");
            let type;
            if (space.attributes.family_id) {
                const { data: family } = yield pawClient.execute(`/api/d2/families/${space.attributes.family_id}`, "get");
                type = family.attributes.title;
            }
            const batch = new client_1.default.Batch({
                Name: space.attributes.title,
                ProjectId: projectId,
                Properties: [
                    { Name: "kyc_id_folder", Value: spaceId },
                    { Name: "kyc_id_subfolder", Value: spaceId },
                    { Name: "kyc_type", Value: type }
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
            const documents = yield pawClient.getDocs({ space_ids: [space.id] });
            yield Promise.all(documents.map((doc) => __awaiter(this, void 0, void 0, function* () {
                yield Promise.all(doc.attributes.pages_urls.map((page_url, index) => __awaiter(this, void 0, void 0, function* () {
                    const data = yield pawClient.execute(page_url, "get", { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(data, 'binary').toString('base64');
                    // @ts-ignore
                    const file = new client_1.default.File({ Name: `${doc.id}_page${index + 1}`, Bytes: buffer });
                    try {
                        yield flexicaptureClient.call("AddNewImage", { sessionId, batchId, file });
                    }
                    catch (e) {
                        console.log(e.message);
                    }
                    console.log(`add new image on batch ${batchId}`);
                })));
            })));
            yield flexicaptureClient.call("CloseBatch", { sessionId, batchId });
            console.log(`batch ${batchId} closed`);
            yield flexicaptureClient.call("ProcessBatch", { sessionId, batchId });
            console.log(`batch ${batchId} created`);
            console.log(`item ${spaceId} processed`);
        });
        const flexicaptureClient = new client_1.default({
            host: process.env.FLEXICAPTURE_HOST,
            username: process.env.FLEXICAPTURE_USERNAME,
            password: process.env.FLEXICAPTURE_PASSWORD
        });
        const pawClient = new paw_client_1.default({
            host: process.env.PAW_HOST,
            credentials: {
                username: process.env.PAW_USERNAME,
                password: process.env.PAW_PASSWORD
            }
        });
        const fayeClient = new faye_1.default.Client(`${process.env.PAW_HOST}/faye`);
        fayeClient.on('transport:up', function () {
            console.log("waiting for new space to process ...");
        });
        fayeClient.subscribe('/logs/users', ({ code, log_id }) => __awaiter(this, void 0, void 0, function* () {
            console.log(code);
            if (code !== "flexicapture") {
                return;
            }
            yield pawClient.login();
            const { data: { attributes: { action: parent_id } } } = yield pawClient.execute(`/api/d2/logs/${log_id}`, "get");
            if (!parent_id) {
                console.log("space_id not found in action");
                return;
            }
            console.log(`start space ${parent_id}`);
            const { userIdentity } = yield flexicaptureClient.call("GetCurrentUserIdentity");
            const { userId } = yield flexicaptureClient.call("FindUser", { userLogin: userIdentity.Name });
            const { sessionId } = yield flexicaptureClient.call("OpenSession", { roleType: 1, stationType: 1 });
            const { projectId } = yield flexicaptureClient.call("OpenProject", {
                sessionId,
                projectNameOrGuid: process.env.FLEXICAPTURE_PROJECT_GUID
            });
            console.log(`project ${projectId} opened`);
            const { data: { attributes: { space_ids } } } = yield pawClient.execute(`/api/d2/spaces/${parent_id}`, "get");
            console.log(`${space_ids.length} spaces found`);
            yield space_ids.reduce((promise, space_id) => __awaiter(this, void 0, void 0, function* () {
                yield promise;
                yield _processSpace(projectId, sessionId, userId, parent_id, space_id);
            }), Promise.resolve());
            yield flexicaptureClient.call("CloseProject", { sessionId, projectId });
            yield flexicaptureClient.call("CloseSession", { sessionId });
            console.log(`end space ${parent_id}`);
            console.log("waiting for new space to process ...");
        }));
    });
}
main();
