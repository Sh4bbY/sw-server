'use strict';

const Sequelize = require('sequelize');
const User      = require('./User');

const model = {
  title        : {type: Sequelize.STRING(255), allowNull: false},
  description  : {type: Sequelize.TEXT, allowNull: false},
  createdAt    : {type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false},
  updatedAt    : {type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'), allowNull: false},
  relatedUserId: {
    type: Sequelize.INTEGER,
    refs: {
      model: User.model,
      key  : 'id',
    },
  },
};

const seeds = [{
  title        : 'Test Project',
  description  : 'lorem ipsum',
  relatedUserId: 1,
}];

module.exports = {
  model,
  seeds,
  defineModel: sequelize => sequelize.define('Project', model),
};
