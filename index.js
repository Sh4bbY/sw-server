'use strict';

const logger          = require('log4js').getLogger('server');
const Server          = require('./src/Server');
const AuthService     = require('./src/services/AuthService');
const config          = require('./config.json');

try {
    const secrets = require('./secrets.json');
    /** assign secrets to config */
    Object.keys(config).forEach(key => Object.assign(config[key], secrets[key]));
} catch (err) {
    console.log('no secrets.json in place');
}


const server = new Server(config.express);
//const mysql  = new MysqlClient(config.mysql);
//const mongo  = new MongoClient(config.mongodb);
//const elastic = new ElasticClient(config.elasticsearch);

//server.registerClient('mysql', mysql);
//server.registerClient('mongo', mongo);
//server.registerClient('elastic', elastic);

const authService     = new AuthService(server);

server.registerService(authService);

server.start()
    .catch(() => {
        logger.error('server could not be started. connections will be closed.');
        server.stop();
    });

