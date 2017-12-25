const Joi = require('joi');
const logger = require('log4js').getLogger('server');


module.exports = class AbstractService {
  constructor(server) {
    this.server = server;
    this.router = server.router;
  }

  static hasValidParams(params, schema) {
    const validation = Joi.validate(params, schema);

    if (validation.error) {
      validation.error.details.forEach(err => logger.error(err.message));
      return false;
    }
    return true;
  }
};
