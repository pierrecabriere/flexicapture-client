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
const axios_1 = __importDefault(require("axios"));
const defaultConfig = {
    host: "",
    username: "",
    password: ""
};
class FlexicaptureClient {
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
    call(methodName, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this._axios.post(null, {
                MethodName: methodName,
                Params: params
            });
            return data;
        });
    }
    // Sessions
    CloseSession(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call("CloseSession", params);
        });
    }
    GetSessionInfo(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.call("GetSessionInfo", params);
        });
    }
    IsSessionExists(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { result } = yield this.call("IsSessionExists", params);
            return result;
        });
    }
    OpenSession(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sessionId } = yield this.call("OpenSession", params);
            return sessionId;
        });
    }
}
exports.default = FlexicaptureClient;
