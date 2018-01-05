'use strict';

const Joi             = require('joi');
const jwt             = require('jsonwebtoken');
const logger          = require('log4js').getLogger('server');
const bcrypt          = require('bcrypt');
const AbstractService = require('./AbstractService');

const SALT_ROUNDS = 10;

module.exports = class AuthService extends AbstractService {
  constructor(server) {
    super(server);

    this.router.post('/api/login', AuthService.handleLogin.bind(this));
    this.router.post('/api/token-login', AuthService.handleTokenLogin.bind(this));
    this.router.post('/api/register', AuthService.handleRegistration.bind(this));
    this.router.get('/api/logout', AuthService.handleLogout.bind(this));
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

    return this.server.client.sql.getUserByEmail(name)
      .then(user => bcrypt.compare(password, user.passwordHash)
        .then(isValid => {
          if (isValid) {
            logger.info(`Ip ${req.ip} logged in as user ${name}`);
            return res.json({
              token   : this.createToken({}),
              username: user.userName,
              email   : user.email,
              id      : user.id,
            });
          }

          logger.warn(`Ip ${req.ip} failed login for user: ${name}`);
          return res.status(400).send('invalid credentials');
        }))
      .catch(err => {
        logger.warn(`Ip ${req.ip} tried login for non-existing-user: ${name}`);
        return res.status(400).send('invalid credentials');
      });
  }

  static handleTokenLogin(req, res) {
    const schema = Joi.object().keys({
      token: Joi.string().required(),
    }).required();

    if (!this.constructor.hasValidParams(req.body, schema)) {
      return res.status(400).send('invalid parameters');
    }

    const {token} = req.body;

    try {
      jwt.verify(token, this.server.config.jwtSecret);
    } catch (err) {
      logger.error(`Ip ${req.ip} tried to login with invalid token: `, token);
      return res.status(400).json({error: 'invalid token'});
    }

    return this.server.client.sql.checkToken(token)
      .then(() => {
        logger.info(`Ip ${req.ip} successfully logged in with token: `, token);
        res.json({token});
      })
      .catch(() => {
        logger.warn(`Ip ${req.ip} tried to login with revoked token: `, token);
        return res.status(400).json({error: 'invalid token'});
      });
  }

  static handleLogout(req, res) {
    // TODO: invalidate token / kill session
    logger.info(`Ip ${req.ip} successfully logged out`);
    return res.status(200).json({status: 200});
  }

  static handleRegistration(req, res) {
    const schema = Joi.object().keys({
      username        : Joi.string().min(3).max(15).required(),
      email           : Joi.string().email().required(),
      password        : Joi.string().min(6).required(),
      password_confirm: Joi.string().min(6).required(),
    }).required().options({abortEarly: false});

    if (!AuthService.hasValidParams(req.body, schema)) {
      return res.status(400).send('invalid parameters.');
    }

    if (req.body.password !== req.body.password_confirm) {
      return res.status(400).send('passwords do not match.');
    }

    bcrypt.genSalt(SALT_ROUNDS)
      .then(salt => bcrypt.hash(req.body.password, salt))
      .then(hash => this.server.client.sql.registerUser(req.body, hash))
      .then(result => res.json(result))
      .catch(err => {
        let msg = err.message;
        if (typeof err === 'object' && !!err.parent) {
          msg = `${err.message}: ${err.parent.message}`;
        }
        logger.warn(msg);
        res.status(400).send(err.message);
      });
  }

  createToken(payload) {
    return jwt.sign(payload, this.server.config.jwtSecret, {expiresIn: '7d'});
  }
};
