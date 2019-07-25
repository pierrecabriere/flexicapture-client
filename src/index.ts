import axios from "axios";

interface IClientConfig {
  host: string,
  username: string,
  password: string
}

const defaultConfig: IClientConfig = {
  host: "",
  username: "",
  password: ""
};

class FlexicaptureClient {
  private _axios;
  private _config;

  constructor(config: IClientConfig) {
    this._config = Object.assign({}, defaultConfig, config);

    this._axios = axios.create({
      baseURL: this._config.host,
      auth: {
        username: this._config.username,
        password: this._config.password
      }
    });
  }

  // generic

  async call(methodName: string, params: any) {
    const { data } = await this._axios.post(null, {
      MethodName: methodName,
      Params: params
    });

    return data;
  }

  // Sessions

  async CloseSession(params: { sessionId: number }) {
    return await this.call("CloseSession", params);
  }

  async GetSessionInfo(params: { sessionId: number, userName: string, computerName: string, roleType: number }) {
    return await this.call("GetSessionInfo", params);
  }

  async IsSessionExists(params: { sessionId: number }) {
    const { result } = await this.call("IsSessionExists", params);

    return result;
  }

  async OpenSession(params: { roleType: number, stationType: number }) {
    const { sessionId } = await this.call("OpenSession", params);

    return sessionId;
  }

  // Projects
}

export default FlexicaptureClient;