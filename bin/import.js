#!/usr/bin/env node

const tile38 = require('tile38');
const has = require('has');
const fs = require('fs');
const ndjson = require('ndjson');
const minimist = require('minimist');
const map = require('map-stream');
const crypto = require('crypto');
const winston = require('winston');

const client = new tile38();
const argv = minimist(process.argv.slice(2));

function insertFeature(feature, callback) {
  let id = crypto.randomBytes(20).toString('hex');
  winston.info('Adding feature:', id);
  return client.set('features', id, feature)
    .then(function (data) { 
      return callback(null, data);
    })
    .catch(function (err) {
      return callback(err);
    });
}

if (!has(argv, 'file') && !has(argv, 'f')) {
  winston.log('Usage: node import.js -f file.features');
  winston.log('file.features is a line delimited geojson feature list');
  process.exit(1);
} else {
  // Read in the features
  const filename = argv.f || argv.file;
  fs.createReadStream(filename)
    .pipe(ndjson.parse())
    .pipe(map(insertFeature))
    .on('end', function () {
      client.quit().then(function () {
        winston.info('Exiting. Good bye')
        process.exit(0);
      });
    })
    .on('error', function (err) {
      winston.error(err);
      process.exit(1);
    });
}
