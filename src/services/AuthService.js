'use strict';

const Joi             = require('joi');
const jwt             = require('jsonwebtoken');
const logger          = require('log4js').getLogger('server');
// const bcrypt          = require('bcrypt');
const AbstractService = require('./AbstractService');


module.exports = class AuthService extends AbstractService {
  constructor(server) {
    super(server);

    this.router.post('/api/login', this.constructor.handleLogin.bind(this));
    this.router.post('/api/register', this.constructor.handleRegistration.bind(this));
    this.router.get('/api/logout', this.constructor.handleLogout.bind(this));
  }

  static handleLogin(req, res) {
    const schema = Joi.object().keys({
      name    : Joi.string().required(),
      password: Joi.string().required(),
    }).required();

    if (!this.constructor.hasValidParams(req.body, schema)) {
      return res.status(400).send('invalid parameters');
    }

    const {name, password} = req.body;

    if (name === 'test' && password === 'test1') {
      logger.info(`Ip ${req.ip} logged in as user ${name}`);
      const payload = {
        id   : 'dummyId',
        name : 'dummyUserName',
        email: 'dummyEmailAddress',
      };
      return res.json(this.createTokenResponse(payload));
    }

    // logger.warn(`Ip ${req.ip} failed login for user ${name}: `, err.message);
    logger.warn(`Ip ${req.ip} failed login for user ${name}: `);
    return res.status(400).send('invalid credentials');
  }

  static handleLogout(req, res) {
    // TODO: invalidate token / kill session
    return res.sendStatus(200);
  }

  static handleRegistration(req, res) {
    const schema = Joi.object().keys({
      username        : Joi.string().min(3).max(15).required(),
      email           : Joi.string().email().required(),
      password        : Joi.string().min(6).required(),
      password_confirm: Joi.string().min(6).required(),
    }).required().options({abortEarly: false});

    if (!this.constructor.hasValidParams(req.body, schema)) {
      return res.status(400).send('invalid parameters');
    }

    if (req.body.password !== req.body.password_confirm) {
      return res.status(400).send('passwords do not match');
    }

    logger.debug('received valid registration request');

    return res.json({
      id   : 1,
      name : 'test',
      email: 'test@test.de',
    });
  }

  createTokenResponse(payload) {
    return {
      isAuthenticated: true,
      token          : jwt.sign(payload, this.server.config.jwtSecret, {expiresIn: '7d'}),
    };
  }
};
