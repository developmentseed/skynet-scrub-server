const rewire = require('rewire');
const ava = require('ava');
const has = require('has');
const logger = require('../utils/logger');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const dbObjToGeoJSON = require('../utils/db_to_geojson');
const R = require('ramda');

var dbMock = require('./utils.js').db;

let test = ava.test;
let singleFeature = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/feature.geojson')));

test.beforeEach(t => {
  var db = dbMock;

  let lib = rewire('../lib.js');
  lib.__set__({ db });

  let {app, client} = lib.init({});

  t.context.app = app;
  t.context.client = client;
})

test('getFeatureById - get existing feature', async t => {
  let id = t.context.client.set('features', '1', singleFeature);
  const res = await request(t.context.app)
    .get('/features/1.json')
    .set('Accept', 'application/json')

  t.is(res.status, 200);
  t.deepEqual(res.body, singleFeature);
});

test('setFeatureById - create new feature', async t => {
  const res = await request(t.context.app)
    .put('/features/2.json')
    .send(singleFeature)

  t.is(res.status, 200);
  let feature = await t.context.client.get('features', '2');
  let geo = dbObjToGeoJSON(feature);
  t.deepEqual(singleFeature.geometry, geo.geometry);
  t.is(geo.properties.id, '2');
});

test('deleteFeatureById - delete feature', async t => {
  const id = await t.context.client.set('features', '3', singleFeature);

  const res = await request(t.context.app)
    .delete('/features/3.json')

  t.is(res.status, 200);
  t.is(Object.keys(t.context.client.data).length, 0);
});

test('getFeatures - get all features', async t => {
  const ids = await Promise.all([
    t.context.client.set('features', '1', singleFeature),
    t.context.client.set('features', '2', singleFeature),
    t.context.client.set('features', '3', singleFeature)
  ]);
  t.is(Object.keys(t.context.client.data).length, 3); 

  const res = await request(t.context.app)
    .get('/features.json')
    .set('Accept', 'application/json')

  t.is(res.status, 200);
  t.is(res.body.features.length, 3)
});

test('commit - commit multiple features', async t => {
  let differentFeature = R.assocPath(['geometry', 'coordinates'],
    [[123,9],[123,10]], 
    singleFeature);

  const ids = await Promise.all([
    t.context.client.set('features', '1', singleFeature),
    t.context.client.set('features', '2', differentFeature),
    t.context.client.set('features', '3', singleFeature)
  ]);

  let features = {};
  features['1'] = R.assocPath(['properties', 'id'], '1', differentFeature);
  features['2'] = R.assocPath(['properties', 'id'], '2', singleFeature);
  features['4'] = R.assocPath(['properties', 'id'], '4', differentFeature);

  let commit = {
    'edited': R.values(features),
    'deleted': ['3']
  }

  const res = await request(t.context.app)
    .post('/commit')
    .send(commit)

  t.is(res.status, 200);
  t.is(Object.keys(t.context.client.data).length, 3); 

  // Compare data
  ['1', '2', '4'].forEach(async (id) => {
    let feature = await t.context.client.get('features', id);
    t.deepEqual(features[id], dbObjToGeoJSON(feature));
  })
});
