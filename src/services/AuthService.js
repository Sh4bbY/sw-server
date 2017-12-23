'use strict';

const Joi             = require('joi');
const jwt             = require('jsonwebtoken');
const logger          = require('log4js').getLogger('server');
const bcrypt          = require('bcrypt');
const AbstractService = require('./AbstractService');


module.exports = class AuthService extends AbstractService {
  constructor(server) {
    super(server);
    
    this.router.post('/api/login', handleLogin.bind(this));
  }
  
  createTokenResponse(payload) {
    return {
      token: jwt.sign(payload, this.server.config.jwtSecret, {expiresIn: '7d'})
    };
  }
};

function handleLogin(req, res) {
  const schema = Joi.object().keys({
    name    : Joi.string().required(),
    password: Joi.string().required()
  }).required();
  
  if (!this.hasValidParams(req.body, schema)) {
    return res.status(400).send('invalid parameters');
  }
  
  const {name, password} = req.body;
  
  if (name === 'test' && password === 'test1') {
    logger.info(`Ip ${req.ip} logged in as user ${name}`);
    const payload = {
      id   : 'dummyId',
      name : 'dummyUserName',
      email: 'dummyEmailAddress'
    };
    return res.json(this.createTokenResponse(payload));
  }
  
  //logger.warn(`Ip ${req.ip} failed login for user ${name}: `, err.message);
  logger.warn(`Ip ${req.ip} failed login for user ${name}: `);
  return res.status(400).send('invalid credentials');
}
