require('dotenv').config();

import Clients from "./services/Clients";
import Utils from "./services/Utils";

// TEST
const query = {
  "family_id": "5da47e13b289d504a18db395",
  "superfields.status": "pret_pour_saisie",
  "percent_min": 10,
  "percent_max": 10
};

// MJ
// const query = {
//   "family_id": "5ced18a1b289d537b6b71051",
//   "responsible": "5d7cdf77b289d507adbeeba2",
//   "superfields.status": "pret_pour_saisie",
//   "percent_min": 10,
//   "percent_max": 10
// };

// AMO
// const query = {
//   "family_id": "5d6f5a15b289d56af4e127c6",
//   "responsible": "5d7cdf77b289d507adbeeba2",
//   "superfields.status": "pret_pour_saisie",
//   "percent_min": 10,
//   "percent_max": 10
// };

// SUB1
// const query = {
//   "family_id": "5d4055b3b289d564eadbe69c",
//   "responsible": "5d7cdf77b289d507adbeeba2",
//   "superfields.status": "pret_pour_saisie",
//   "percent_min": 10,
//   "percent_max": 10
// };

Utils.import({ query });