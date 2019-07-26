# flexicapture-client [WIP] 🛠

## Minimal configuration

```javascript
import FlexicaptureClient from "flexicapture-client";

const config = {
  host: "http:// <ApplicationServer>/FlexiCapture12/Server/FCAuth/API/v1/Json",
  username: "johndoe",
  password: "p@ssword"
}

const client = new FlexicaptureClient(config);
```

## Generic call

```javascript
const data = await client.call("MethodName", { ...params });
```

#### Example

```javascript
const data = await client.call("OpenSession", { roleType: 1, stationType: 1 });

console.log(data.sessionId);
```