const rewire = require('rewire');
const ava = require('ava');
const has = require('has');
const logger = require('../utils/logger');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const dbObjToGeoJSON = require('../utils/db_to_geojson');

var dbMock = require('./utils.js').db;

let test = ava.test;
let singleFeature = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/feature.geojson')));

var client = new dbMock();

let lib = rewire('../lib.js');
lib.__set__({
  client: client
});
let app = lib.init();

test.before(async t => {
  return await client.set('features', '1', singleFeature);
});

test('getFeatureById - get existing feature', async t => {
  const res = await request(app)
    .get('/features/1.json')
    .set('Accept', 'application/json')

  t.is(res.status, 200);
  t.deepEqual(res.body, singleFeature);
});

test('setFeatureById - create new feature', async t => {
  const res = await request(app)
    .put('/features/2.json')
    .send(singleFeature)

  t.is(res.status, 200);
  let feature = await client.get('features', '2');
  let geo = dbObjToGeoJSON(feature);
  t.deepEqual(singleFeature.geometry, geo.geometry);
  t.is(geo.properties.id, '2');
});
