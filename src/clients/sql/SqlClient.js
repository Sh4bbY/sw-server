'use strict';

const Sequelize = require('sequelize');
const User      = require('./models/User');
const Project   = require('./models/Project');
const logger    = require('log4js').getLogger('SqlClient');

module.exports = class SqlClient {
  constructor(config) {
    this.sequelize = new Sequelize({
      host            : config.host,
      port            : config.port,
      dialect         : config.dialect, // 'mysql'|'sqlite'|'postgres'|'mssql'
      logging         : false,
      operatorsAliases: false,
      database        : config.database,
      username        : config.username,
      password        : config.password,
      pool            : {
        max    : 5,
        min    : 0,
        acquire: 30000,
        idle   : 10000,
      },
      // SQLite only
      // storage: 'path/to/database.sqlite',
    });
  }

  connect() {
    return this.sequelize.authenticate()
      .then(() => {
        User.defineModel(this.sequelize);
        Project.defineModel(this.sequelize);
        return Promise.resolve();
      })
      .catch(err => {
        logger.error('Could not authenticate with sql server, reason: ', err.message);
      });
  }

  checkToken(token) {
    // TODO: implement check if token is revoked
    return Promise.resolve(true);
  }

  registerUser(user, hash) {
    return this.sequelize.models.User.build({
      userName    : user.username,
      email       : user.email,
      passwordHash: hash,
    }).save()
      .then(result => result.dataValues);
  }

  getUserByEmail(email) {
    return this.sequelize.models.User.findOne({where: {email}})
      .then(result => result.dataValues);
  }

  getUserById(userId) {
    return this.sequelize.models.User.findById(userId)
      .then(result => result.dataValues);
  }

  disconnect() {
    return this.sequelize.close();
  }

  dropUserEntries() {
    return this.sequelize.models.User.destroy({truncate: true});
  }
};

