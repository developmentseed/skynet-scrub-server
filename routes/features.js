const notDefined = require('not-defined');
const client = require('../db');
const logger = require('../utils/logger');
const fc = require('../utils/fc');
const dbObjToGeoJSON = require('../utils/db_to_geojson');
const SphericalMercator = require('sphericalmercator');
const merc = new SphericalMercator();
const gvt = require('geojson-vt');
const vtpbf = require('vt-pbf');

/* Get features by id */
function getFeatureById (req, res) {
  var id = req.params.id;

  if (notDefined(id)) {
    res.boom.badRequest('id is required');
  }

  client.get('features', id)
    .then(function (data) {
      let feature = dbObjToGeoJSON(data);
      res.json(feature);
    });
}

/* Get features from db at z,x,y tile */
function queryTile(z, x, y) {
  logger.debug(z,x,y);
  const bbox = merc.bbox(x, y, z);
  return client.intersectsQuery('features')
    .bounds(bbox[1], bbox[0], bbox[3], bbox[2])
    .execute();
}

/* Get features at z,x,y tile */
function getFeaturesTile(req, res) {
  let p = req.params;
  let x = parseInt(p.x);
  let y = parseInt(p.y);
  let z = parseInt(p.z);
  let format = p.format;

  queryTile(z, x, y)
    .then(function (data) {
      let features = data.objects.map(dbObjToGeoJSON);

      // Send a vector tile
      if (format === 'pbf') {
        if (features.length > 0) {
          const tileIndex = gvt(fc(features), {indexMaxZoom: z, maxZoom: z});
          const tile = tileIndex.getTile(z, x, y);
          let buf = vtpbf.fromGeojsonVt({ 'geojsonLayer': tile})
          res.writeHead(200, {
            'Content-Type': 'application/x-protobuf'
          });
          res.end(buf)
        } else {
          res.status(404).send()
        }
      // Send a GeoJSON array
      } else if (format === 'json'){
        res.json(features);
      } else {
        res.boom.badRequest('format must be pbf or json');
      }
    })
    .catch(function (err) {
      logger.error(err);
      res.boom.badImplementation('server error!');
    });
}

module.exports = {
  getFeaturesTile: getFeaturesTile,
  getFeatureById: getFeatureById
}
