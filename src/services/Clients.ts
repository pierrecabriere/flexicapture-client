import FlexicaptureClient from "../client";
import PawClient from "paw-client";
import Faye from "faye";

class Clients {
  static _flexicapture = null;
  static _paw = null;
  static _faye = null;

  static resetFaye() {
    // Création du client Faye qui servira à se connecter au socket PaW (chargement dess dossiers en temps réel)
    this._faye = new Faye.Client(`${ process.env.PAW_HOST }/faye`);
  }

  static resetFlexicapture() {
    // Création du client Flexicapture qui servira à interagir avec le serveur flexicapture
    this._flexicapture = new FlexicaptureClient({
      host: process.env.FLEXICAPTURE_HOST,
      username: process.env.FLEXICAPTURE_USERNAME,
      password: process.env.FLEXICAPTURE_PASSWORD
    });

    return this;
  }

  static resetPaw() {
    // Création du client Plugandwork qui servira à interagir avec le serveur PaW
    this._paw = new PawClient({
      host: process.env.PAW_HOST,
      credentials: {
        username: process.env.PAW_USERNAME,
        password: process.env.PAW_PASSWORD
      }
    });
  }

  static get flexicapture() {
    if (!this._flexicapture) {
      Clients.resetFlexicapture();
    }

    return this._flexicapture;
  }

  static get paw() {
    if (!this._paw) {
      Clients.resetPaw();
    }

    return this._paw;
  }

  static get faye() {
    if (!this._faye) {
      Clients.resetFaye();
    }

    return this._faye;
  }
}

export default Clients;