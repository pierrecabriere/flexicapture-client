import axios from "axios";
import Batch from "./models/Batch";
import Document from "./models/Document";
import File from "./models/File";

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

  // models

  static Batch = Batch;
  static Document = Document;
  static File = File;

  // constructor

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

  async call(methodName: string, params: any = {}) {
    const { data } = await this._axios.post(null, {
      MethodName: methodName,
      Params: params
    }, {
      maxContentLength: 52428890
    });

    return data;
  }
}

export default FlexicaptureClient;
export { FlexicaptureClient, Batch, Document, File };