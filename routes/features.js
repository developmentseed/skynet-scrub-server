const notDefined = require('not-defined');
const logger = require('../utils/logger');
const fc = require('../utils/fc');
const dbObjToGeoJSON = require('../utils/db_to_geojson');
const SphericalMercator = require('sphericalmercator');
const merc = new SphericalMercator();
const gvt = require('geojson-vt');
const vtpbf = require('vt-pbf');

/* Inject client connection */
module.exports = function (client) {
  /* Get features from db at z,x,y tile */
  function queryTile(z, x, y) {
    const bbox = merc.bbox(x, y, z);
    return client.intersectsQuery('features')
      .bounds(bbox[1], bbox[0], bbox[3], bbox[2])
      .execute();
  }

  return {
    /* Get features by id */
    getFeatureById: async (req, res) => {
      var id = req.params.id;

      if (notDefined(id)) {
        res.boom.badRequest('id is required');
      }

      try {
        let feature = await client.get('features', id);
        res.json(dbObjToGeoJSON(feature));
      } catch (err) {
        logger.error(err);
        res.status(404).send('Not found');
      }
    },

    /* Get features at z,x,y tile */
    getFeaturesTile: async (req, res) => {
      let p = req.params;
      let x = parseInt(p.x);
      let y = parseInt(p.y);
      let z = parseInt(p.z);
      let format = p.format;

      let tileData = await queryTile(z, x, y)
      let features = tileData.objects.map(dbObjToGeoJSON);

      try {
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
            res.status(404).send();
          }
          // Send a GeoJSON array
        } else if (format === 'json'){
          res.json(features);
        } else {
          res.boom.badRequest('format must be pbf or json');
        }
      } catch (err) {
        logger.error(err);
        res.boom.badImplementation('server error!');
      };
    }
  }
}
