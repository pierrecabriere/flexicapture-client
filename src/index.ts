require('dotenv').config();

import Faye from "faye";
import PawClient from "paw-client";
import FlexicaptureClient from "./client";

async function main() {
  const _processSpace = async (projectId, sessionId, userId, parentId, spaceId) => {
    console.log(`process item ${ spaceId }`);
    const { data: space } = await pawClient.execute(`/api/d2/spaces/${ spaceId }`, "get");

    let type;
    if (space.attributes.family_id) {
      const { data: family } = await pawClient.execute(`/api/d2/families/${ space.attributes.family_id }`, "get");
      type = family.attributes.title;
    }

    const batch = new FlexicaptureClient.Batch({
      Name: space.attributes.title,
      ProjectId: projectId,
      Properties: [
        { Name: "kyc_id", Value: space.id },
        { Name: "kyc_type", Value: type }
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

    const documents = await pawClient.getDocs({ space_ids: [space.id] });
    await Promise.all(documents.map(async doc => {
      await Promise.all(doc.attributes.pages_urls.map(async (page_url, index) => {
        const data = await pawClient.execute(page_url, "get", { responseType: 'arraybuffer' });
        const buffer = Buffer.from(data, 'binary').toString('base64');
        // @ts-ignore
        const file = new FlexicaptureClient.File({ Name: `${ doc.id }_page${ index + 1 }`, Bytes: buffer });
        try {
          await flexicaptureClient.call("AddNewImage", { sessionId, batchId, file });
        } catch (e) {
          console.log(e.message);
        }
        console.log(`add new image on batch ${ batchId }`);
      }));
    }));

    await flexicaptureClient.call("CloseBatch", { sessionId, batchId });
    console.log(`batch ${ batchId } closed`);
    await flexicaptureClient.call("ProcessBatch", { sessionId, batchId });
    console.log(`batch ${ batchId } created`);
    console.log(`item ${ spaceId } processed`);
  };

  const flexicaptureClient = new FlexicaptureClient({
    host: process.env.FLEXICAPTURE_HOST,
    username: process.env.FLEXICAPTURE_USERNAME,
    password: process.env.FLEXICAPTURE_PASSWORD
  });
  const pawClient = new PawClient({
    host: process.env.PAW_HOST,
    credentials: {
      username: process.env.PAW_USERNAME,
      password: process.env.PAW_PASSWORD
    }
  });

  const fayeClient = new Faye.Client(`${ process.env.PAW_HOST }/faye`);
  fayeClient.subscribe('/logs/users', async ({ code, log_id }) => {
    if (code !== "flexicapture") {
      return;
    }

    await pawClient.login();

    const { data: { attributes: { action: parent_id } } } = await pawClient.execute(`/api/d2/logs/${ log_id }`, "get");

    if (!parent_id) {
      console.log("space_id not found in action");
      return;
    }

    console.log(`start space ${ parent_id }`);

    const { userIdentity } = await flexicaptureClient.call("GetCurrentUserIdentity");
    const { userId } = await flexicaptureClient.call("FindUser", { userLogin: userIdentity.Name });
    const { sessionId } = await flexicaptureClient.call("OpenSession", { roleType: 1, stationType: 1 });
    const { projectId } = await flexicaptureClient.call("OpenProject", {
      sessionId,
      projectNameOrGuid: process.env.FLEXICAPTURE_PROJECT_GUID
    });
    console.log(`project ${ projectId } opened`);

    const { data: { attributes: { space_ids } } } = await pawClient.execute(`/api/d2/spaces/${ parent_id }`, "get");
    console.log(`${ space_ids.length } spaces found`);
    await space_ids.reduce(async (promise, space_id) => {
      await promise;

      await _processSpace(projectId, sessionId, userId, parent_id, space_id);
    }, Promise.resolve());

    await flexicaptureClient.call("CloseProject", { sessionId, projectId });
    await flexicaptureClient.call("CloseSession", { sessionId });

    console.log(`end space ${ parent_id }`);

    console.log("waiting for new space to process ...");
  });

  console.log("waiting for new space to process ...");
}

main();