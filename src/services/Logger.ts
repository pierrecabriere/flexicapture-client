import winston from "winston";

class Logger {
  static _logger = null;

  static resetLogger() {
    this._logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
        new winston.transports.File({ filename: 'import.log' }),
        new winston.transports.Console({ format: winston.format.simple() })
      ]
    });
  }

  static get logger() {
    if (!this._logger) {
      this.resetLogger();
    }

    return this._logger;
  }

  static info(...opts) {
    return this.logger.info(...opts);
  }

  static error(...opts) {
    return this.logger.error(...opts);
  }
}

export default Logger;