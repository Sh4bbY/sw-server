'use strict';

const logger      = require('log4js').getLogger('server');
const Server      = require('./Server');
const AuthService = require('./services/AuthService');
const SqlClient   = require('./clients/sql/SqlClient');
const config      = require('../config.json');

try {
  // eslint-disable-next-line global-require
  const secrets = require('../secrets.json');
  Object.keys(config).forEach(key => Object.assign(config[key], secrets[key]));
} catch (err) {
  logger.warn('no secrets.json in place');
}

const server = new Server(config.express);

const sqlClient = new SqlClient(config.sql);
server.registerClient('sql', sqlClient);

const authService = new AuthService(server);
server.registerService(authService);

server.start()
  .catch(() => {
    logger.error('server could not be started. connections will be closed.');
    server.stop();
  });

