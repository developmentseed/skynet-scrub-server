const notDefined = require('not-defined');
const logger = require('../utils/logger');
const fc = require('../utils/fc');
const dbObjToGeoJSON = require('../utils/db_to_geojson');
const SphericalMercator = require('sphericalmercator');
const merc = new SphericalMercator();
const gvt = require('geojson-vt');
const vtpbf = require('vt-pbf');
const R = require('ramda');

/* Inject client connection */
module.exports = function (client) {
  /* Wrap cursor to get all data */
  async function wrapCursor (f) {
    let done = false;
    let cursor = 0;
    let results = [];
    while (!done) {
      const res = await f(cursor);
      results.push(res.objects);
      done = (res.cursor === 0);
      cursor = res.cursor
    }
    return R.flatten(results);
  }

  /* Get features from db at z,x,y tile */
  function queryTile(z, x, y) {
    const bbox = merc.bbox(x, y, z);
    return wrapCursor(function (cursorValue) {
      return client.intersectsQuery('features')
        .bounds(bbox[1], bbox[0], bbox[3], bbox[2])
        .cursor(cursorValue)
        .execute();
    });
  }

  return {
    /* Get feature by id */
    getFeatureById: async (req, res) => {
      let id = req.params.id;

      if (notDefined(id)) {
        res.boom.badRequest('id is required');
      }

      try {
        let feature = await client.get('features', id);
        res.json(dbObjToGeoJSON(feature));
      } catch (err) {
        logger.error(err);
        res.boom.notFound()
      }
    },

    /* Set feature by id */
    setFeatureById: async (req, res) => {
      let id = req.params.id;
      let body = req.body;

      if (notDefined(id)) {
        res.boom.badRequest('id is required');
      }

      try {
        let ret = await client.set('features', id, body);
        res.status(200).json('ok');
      } catch (err) {
        logger.error(err);
        res.boom.badImplementation('Server error!');
      }
    },

    getFeatures: async (req, res) => {
      let page = parseInt(req.query.p || 1);
      let calculatedCursor = page * 100 - 100;

      try {
        let dbResponse = await client.scanQuery('features')
          .cursor(calculatedCursor)
          .objects()
          .execute()
        logger.debug(JSON.stringify(dbResponse));

        let ret = {
          features: dbResponse.objects,
          pagination: {
            next: (dbResponse.cursor === 0) ? 1 : (page + 1)
          }
        }
        res.status(200).json(ret);

      } catch (err) {
        logger.error(err);
        res.boom.badImplementation('Server error!');
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
      logger.debug(JSON.stringify(tileData));
      let features = tileData.map(dbObjToGeoJSON);

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
