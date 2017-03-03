const rewire = require('rewire');
const ava = require('ava');
const has = require('has');
const logger = require('../utils/logger');
const request = require('supertest');
const fs = require('fs');
const path = require('path');

var dbMock = require('./utils.js').db;

let test = ava.test;
let singleFeature = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/feature.geojson')));

var client = new dbMock();
  
let app = rewire('../index.js');
app.__set__({
  client: client
})

test.before(t => {
  return client.set('1', singleFeature);
})

test('getFeatureById', t => {
  request(app)
    .get('/features/1')
    .set('Accept', 'application/json')
    .expect(200)
    .then((err, res) => {
      if (err) return t.fail(err);
      return t.deepEqual(singleFeature, res);
    });
});
