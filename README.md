# @software-wanted/server

[![Build Status](https://travis-ci.org/Sh4bbY/sw-server.svg?branch=master)](https://travis-ci.org/Sh4bbY/sw-server) 
![License MIT](https://img.shields.io/badge/license-MIT-green.svg) 

a node and express based backend application.

## Getting started

#### Setup MySql Docker Container:
- install docker
- run `docker pull mysql:5.7` to get the 5.7 version of the mysql docker image.
- run `docker build -t sw/mysql ./docker/mysql` to Build a docker sw/mysql image.
- run `docker run -d --name sql -p 3306:3306 sw/mysql` to run a sql container from the image.
- run `yarn migrate` to install sql orm mappings.

        

This project is using yarn for dependency management. Install yarn by `npm i -g yarn`.



npm tasks:

```
yarn start          // runs the application in watch mode
yarn test           // runs the mocha testsuite
yarn test:watch     // runs mocha in watch mode
yarn test:coverage  // runs mocha and generate code coverage reports
yarn lint           // runs eslint static code quality checks
yarn ci:travis      // runs the lint and test task (triggered by travis-ci.org)
yarn migrate        // migrate the database
yarn migrate:drop   // drops the database migration
```

## Contributing

This repository supports [commitizen](https://github.com/commitizen/cz-cli) 
and follows the [angular.js commit guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)

Enable commitizen by `npm install -g commitizen`. 
Commit your changes by `git cz`
