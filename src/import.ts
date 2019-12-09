require('dotenv').config();

// @ts-ignore
import query from "../queries/amo.json";
import Utils from "./services/Utils";

Utils.import({ query });