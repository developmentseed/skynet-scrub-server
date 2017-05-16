#!/usr/bin/env node

const tile38 = require('tile38');
const minimist = require('minimist');
const winston = require('winston');

const argv = minimist(process.argv.slice(2));
let domain = argv.h || 'localhost:9851';
let [host, port] = domain.split(':');

const client = new tile38({ host, port });

// drop all the features
try {
  winston.info('Dropping all features');
  client.drop('features')
    .then(data => {
      winston.info(data);
      winston.info('Exiting. Good bye');
      process.exit(0);
    })
    .catch(e => {
      throw e;
    });
} catch (e) {
  winston.error(err);
  process.exit(1);
}
