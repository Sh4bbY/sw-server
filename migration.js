'use strict';

const SqlClient = require('./src/clients/sql/SqlClient');
const User      = require('./src/clients/sql/models/User');
const Project   = require('./src/clients/sql/models/Project');
const logger    = require('log4js').getLogger('migation');
const argv      = require('yargs').argv;
const config    = require('./config.json');

const client = new SqlClient(config.sql);

client.connect().then(() => {
  switch (argv.mode) {
    case 'up':
      return dropMigration()
        .then(() => migrate())
        .then(() => client.disconnect())
        .catch(err => {
          logger.error(err.message);
          return client.disconnect();
        });

    case 'drop':
      return dropMigration()
        .then(() => client.disconnect())
        .catch(err => {
          logger.error(err.message);
          return client.disconnect();
        });

    default:
      logger.warn(`Undefined migation mode "${argv.mode}"`);
  }
});

function dropMigration() {
  return client.sequelize.getQueryInterface().dropAllTables();
}

function migrate() {
  return client.sequelize.sync()
    .then(() => client.sequelize.getQueryInterface().bulkInsert('Users', User.seeds))
    .then(() => client.sequelize.getQueryInterface().bulkInsert('Projects', Project.seeds));
}

