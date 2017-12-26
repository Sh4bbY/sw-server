'use strict';

const Sequelize = require('sequelize');

const model = {
  id          : {type: Sequelize.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, unique: true},
  userName    : {type: Sequelize.STRING(45), allowNull: false, unique: true},
  firstName   : {type: Sequelize.STRING(45)},
  lastName    : {type: Sequelize.STRING(45)},
  email       : {type: Sequelize.STRING(60), allowNull: false, unique: true, validate: {isEmail: true}},
  passwordHash: {type: Sequelize.STRING(60), allowNull: false},
  isActive    : {type: Sequelize.BOOLEAN, defaultValue: true},
  isVerified  : {type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false},
  isDeleted   : {type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false},
  createdAt   : {type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false},
  updatedAt   : {type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false},
};

const seeds = [{
  firstName   : 'John',
  lastName    : 'Hancock',
  userName    : 'John H.',
  email       : 'john@hanco.ck',
  passwordHash: 'asdasd',
}, {
  firstName   : 'John',
  lastName    : 'Doe',
  userName    : 'Johnny',
  email       : 'john@doe.com',
  passwordHash: 'asdasd',
}];

module.exports = {
  model,
  seeds,
  defineModel: sequelize => sequelize.define('User', model),
};
