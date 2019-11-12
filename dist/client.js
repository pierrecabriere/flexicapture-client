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
const Page_1 = __importDefault(require("./models/Page"));
exports.Page = Page_1.default;
const axios_1 = __importDefault(require("axios"));
const Batch_1 = __importDefault(require("./models/Batch"));
exports.Batch = Batch_1.default;
const Document_1 = __importDefault(require("./models/Document"));
exports.Document = Document_1.default;
const File_1 = __importDefault(require("./models/File"));
exports.File = File_1.default;
const defaultConfig = {
    host: "",
    username: "",
    password: ""
};
class FlexicaptureClient {
    // constructor
    constructor(config) {
        this._config = Object.assign({}, defaultConfig, config);
        this._axios = axios_1.default.create({
            baseURL: this._config.host,
            auth: {
                username: this._config.username,
                password: this._config.password
            }
        });
    }
    // generic
    call(methodName, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this._axios.post(null, {
                MethodName: methodName,
                Params: params
            }, {
                maxContentLength: 52428890
            });
            return data;
        });
    }
}
// models
FlexicaptureClient.Batch = Batch_1.default;
FlexicaptureClient.Document = Document_1.default;
FlexicaptureClient.File = File_1.default;
FlexicaptureClient.Page = Page_1.default;
exports.FlexicaptureClient = FlexicaptureClient;
exports.default = FlexicaptureClient;
