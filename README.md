# flexicapture-client [WIP]

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

## Methods

### Sessions

#### CloseSession

```javascript
await client.CloseSession({ sessionId: id });
```

#### GetSessionInfo

```javascript
const infos = await client.GetSessionInfo({ sessionId: id, userName: "username", computerName: "computer-name", roleType: 1 });

console.log(infos);
```

#### IsSessionExists

```javascript
const id = await client.OpenSession({ roleType: 1, stationType: 1 });
const isSessionExists = await client.IsSessionExists({ sessionId: id });

console.log(isSessionExists); // true
```

#### OpenSession

```javascript
const sessionId = await client.OpenSession({ roleType: 1, stationType: 1 });

console.log(sessionId);
```