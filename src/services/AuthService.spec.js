'use strict';

const assert   = require('assert');
const logger   = require('log4js').getLogger('server');
const chai     = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const Server      = require('../Server');
const AuthService = require('./AuthService');

const sqlClientMock = {
  connect     : () => Promise.resolve(),
  disconnect  : () => Promise.resolve(),
  registerUser: () => Promise.resolve({
    id: 1,
  }),
};

const config = {
  express: {
    protocol : 'http',
    port     : 8888,
    jwtSecret: 'LPjNP5H0#o1R(5}5r{8Iet5Bf8',
  },
  mongodb: {
    port    : 27017,
    host    : 'localhost',
    database: 'test',
  },
};

logger.setLevel('off');

const validUser = {
  username: 'test-user',
  email   : 'test@user.de',
  password: 'test-password',
};

describe('AuthService', () => {
  let server;
  let service;
  let token;

  before(done => {
    server  = new Server(config.express);
    service = new AuthService(server);
    server.registerClient('sql', sqlClientMock);
    server.registerService(service);
    server.start()
      .then(() => done())
      .catch(err => done(err));
  });

  after(() => server.stop());

  describe('handleRegistration', () => {
    it('should return status 400 if the request was invalid', done => {
      const body = {};
      chai.request(server.app)
        .post('/api/register')
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('should return status 400 if passwords do not match', done => {
      const body = {
        username        : validUser.username,
        email           : validUser.email,
        password        : 'passwordA',
        password_confirm: 'passwordB',
      };
      chai.request(server.app)
        .post('/api/register')
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('should return status 200 if request was valid', done => {
      const body = {
        username        : validUser.username,
        email           : validUser.email,
        password        : validUser.password,
        password_confirm: validUser.password,
      };
      chai.request(server.app)
        .post('/api/register')
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    xit('should return status 406 - Not Acceptable if user name or email is already registered', done => {
      const body = {
        name            : 'dummy',
        email           : validUser.email,
        password        : 'passwordA',
        password_confirm: 'passwordA',
      };
      chai.request(server.app)
        .post('/api/registration')
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 406);
          done();
        });
    });
  });

  describe('handleLogin', () => {
    it('should return status 400 if the request was invalid', done => {
      const body = {};
      chai.request(server.app)
        .post('/api/login')
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('should return status 400 if the name could not be found', done => {
      const body = {name: 'non-existing-user', password: 'invalid-password'};
      chai.request(server.app)
        .post('/api/login')
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('should return status 400 if the password was not valid', done => {
      const body = {
        name    : validUser.name,
        password: 'invalid-password',
      };
      chai.request(server.app)
        .post('/api/login')
        .send(body)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    xit('should return status 200 if login credentials are valid', done => {
      const body = {
        name    : validUser.name,
        password: validUser.password,
      };
      chai.request(server.app)
        .post('/api/login')
        .send(body)
        .end((err, res) => {
          token = res.body.token;
          assert.equal(res.status, 200);
          done();
        });
    });
  });

  describe('logout', () => {
    it('should return status 200 if the request was valid', done => {
      chai.request(server.app)
        .get('/api/logout')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});
