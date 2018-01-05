'use strict';

const assert = require('chai').assert;
const logger = require('log4js').getLogger('sqlclient');

const SqlClient = require('./SqlClient');

logger.setLevel('off');

describe('SqlClient', () => {
  let client;

  const config = {
    host    : 'localhost',
    port    : 3306,
    dialect : 'mysql',
    database: 'mydb',
    username: 'admin',
    password: 'my-secret-pw',
  };

  before(done => {
    client = new SqlClient(config);
    client.connect()
      .then(() => client.dropUserEntries())
      .then(() => done())
      .catch(err => done(err));
  });

  after(done => {
    client.disconnect()
      .then(() => done())
      .catch(err => done(err));
  });

  describe('registerUser', () => {
    it('should register a user successfully', done => {
      const user = {
        username    : 'Johnny',
        email       : 'john@doe.com'
      };
      const hash = 'johns-secret-pass-hash-123123213';

      client.registerUser(user, hash)
        .then(result => {
          assert.equal(result.id, 1);
          assert.equal(result.isActive, true);
          done();
        })
        .catch(err => done(err));
    });
  });

  describe('getUserById', () => {
    it('should retrieve a registered User by a given userId', done => {
      const userId = 1;
      client.getUserById(userId)
        .then(result => {
          assert.equal(result.id, userId);
          assert.equal(result.isActive, true);
          done();
        })
        .catch(err => done(err));
    });
  });
});
