const Sequelize = require("sequelize");

class Database {
  static _model;
  static _sequelize;

  static get sequelize() {
    this._sequelize = this._sequelize || new Sequelize({
      dialect: 'sqlite',
      storage: 'database.sqlite'
    });

    return this._sequelize;
  }

  static get model() {
    this._model = this._model || this.sequelize.define('model', {
      identifier: {
        type: Sequelize.STRING,
        allowNull: false
      }
    }, {});

    return this._model;
  }

  static async processed(identifier) {
    this.model.create({ identifier });
  }

  static async isProcessed(identifier) {
    return this.model.findOne({ where: { identifier } });
  }

  static async initialize() {
    return await this.model.sync();
  }
}

export default Database;