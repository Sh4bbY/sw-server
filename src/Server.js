'use strict';

const express     = require('express');
const compression = require('compression');
const bodyParser  = require('body-parser');
const session     = require('express-session');
const bearerToken = require('express-bearer-token');
const logger      = require('log4js').getLogger('server');
const Joi         = require('joi');
const http        = require('http');
const https       = require('https');
const helmet      = require('helmet');

const configSchema = Joi.object().keys({
  protocol     : Joi.string().valid('http', 'https').required(),
  port         : Joi.number().min(1).max(9999).required(),
  jwtSecret    : Joi.string().min(20).max(40).required(),
  sessionSecret: Joi.string().min(20).max(40),
}).required().options({abortEarly: false});

class Server {
  constructor(config) {
    const validation = Joi.validate(config, configSchema);
    if (validation.error) {
      validation.error.details.forEach(err => logger.error(err.message));
      throw new Error('Invalid Configuration', validation.error);
    }
    this.config              = config;
    this.app                 = express();
    this.router              = express.Router();
    this.services            = [];
    this.connectionCallbacks = [];
    this.client              = {};
  }

  /**
   * starts the server
   * @return Promise
   */
  start() {
    return new Promise((resolve, reject) => {
      this.registerMiddleware();

      // start registered clients
      const promisedClientConnections = Object.keys(this.client)
        .map(key => this.client[key].connect().then(() => logger.debug(`successfully started client "${key}"`)));

      // start the server
      this.server = this.config.protocol === 'https' ? https.createServer(this.app) : http.createServer(this.app);
      this.server.listen(this.config.port, () => {
        // execute registered onConnection callbacks
        this.connectionCallbacks.forEach(cb => cb());
        return Promise.all(promisedClientConnections).then(() => {
          logger.info(`Server is started and listening on port ${this.config.port}`);
          resolve(this.server);
        });
      });

      this.server.on('error', err => {
        logger.error('Server Error: ', err.message);
        reject(err.message);
      });

      process.on('SIGTERM', this.stop.bind(this, true));    // listen for TERM signal .e.g. kill
      process.on('SIGINT', this.stop.bind(this));           // listen for INT signal e.g. Ctrl-C
    });
  }

  /**
   * stops the server
   * @param force Boolean
   * @return Promise
   */
  stop(force) {
    if (force) {
      logger.warn('Forced stop');
      process.exit(0);
    }

    return new Promise((resolve, reject) => {
      if (!this.server) {
        reject(new Error('Server has not yet been started'));
        return;
      }

      Object.keys(this.client).forEach(key => this.client[key].disconnect());
      this.server.close(() => {
        logger.info('Closed all remaining connections.');
        resolve();
      });
    });
  }

  onConnection(handler) {
    this.connectionCallbacks.push(handler);
  }

  /**
   * registers a new client instance to the server.
   * @param name  the name of the database
   * @param client  the database Instance
   */
  registerClient(name, client) {
    this.client[name] = client;
  }

  /**
   * registers a new service to the server.
   * @param service  An Instance of an service
   */
  registerService(service) {
    this.services.push(service);
  }

  registerMiddleware() {
    this.app.use(helmet());
    this.app.use(bearerToken());
    if (this.config.sessionSecret) {
      this.app.use(session({
        secret           : this.config.sessionSecret,
        resave           : false,
        saveUninitialized: true,
      }));
    }
    this.app.use(compression());                                    // use gzip compression for the response body
    this.app.use(bodyParser.urlencoded({extended: false}));         // parse application/x-www-form-urlencoded
    this.app.use(bodyParser.json());                                // parse application/json

    this.app.use(this.router);

    this.app.use(this.constructor.errorHandler);
  }

  static errorHandler(err, req, res, next) {
    let status = 500;
    if (err.name === 'UnauthorizedError') { // error from express-jwt middleware
      status = 401;
    }
    logger.error('Express Error Handler: ', err.message);
    return res.status(status).send(err.message);
  }
}

module.exports = Server;
