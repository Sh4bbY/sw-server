'use strict';

const Sequelize = require('sequelize');
const bcrypt    = require('bcrypt');
const User      = require('./models/User');
const Project   = require('./models/Project');

const SALT_ROUNDS = 10;

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
      });
  }

  registerUser(user) {
    return bcrypt.genSalt(SALT_ROUNDS)
      .then(salt => bcrypt.hash(user.password, salt))
      .then(hash => this.sequelize.models.User.build({
        firstName   : user.firstName,
        lastName    : user.lastName,
        userName    : user.userName,
        email       : user.email,
        passwordHash: hash,
      }).save())
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

