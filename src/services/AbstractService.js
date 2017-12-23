'use strict';

const Joi = require('joi');
//const expressJwt = require('express-jwt');
//const jwt        = require('jsonwebtoken');
const logger = require('log4js').getLogger('server');


module.exports = class AbstractService {
  
  constructor(server) {
    this.server = server;
    this.router = server.router;
    //this.client            = server.client.mongo;
    //this.mysql             = server.client.mysql;
    //this.protectMiddleware = expressJwt({
    //    secret   : server.config.jwtSecret,
    //    isRevoked: this.revokedTokenCallback.bind(this)
    //});
  }
  
  revokedTokenCallback(req, payload, done) {
    this.client.query.revoked.contains({token: req.token})
      .then(isRevoked => done(null, isRevoked));
  }
  
  hasValidParams(params, schema) {
    const validation = Joi.validate(params, schema);
    
    if (validation.error) {
      validation.error.details.forEach(err => logger.error(err.message));
      return false;
    }
    return true;
  }
};


