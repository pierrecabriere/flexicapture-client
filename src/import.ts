require('dotenv').config();

import Utils from "./services/Utils";
import query from "../queries/amo.json";

Utils.import({ query });