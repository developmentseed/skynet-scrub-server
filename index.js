/* Imports */
const express = require('express');
const tile38 = require('tile38');
const SphericalMercator = require('sphericalmercator');
const winston = require('winston');
const minimist = require('minimist');
const gvt = require('geojson-vt');
const vtpbf = require('vt-pbf');

/* Get command line options */
const argv = minimist(process.argv.slice(2));

/* Globals */
const PORT = argv.port || process.env.PORT || 4030
const ADDR = argv.addr || process.env.ADDR || 'http://localhost:' + PORT
const logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({'timestamp': true, 'colorize': true})
    ]
});
const client = new tile38();
const app = express();
const merc = new SphericalMercator();

/* Methods to setup gl-map at root */
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', function (req, res) {
  res.render('map', {
    accessToken: process.env.TOKEN || argv.token,
    uriPrefix: ADDR
  });
});

/* Get features from db at x,y,z tile */
function queryTile(z, x, y) {
  const bbox = merc.bbox(x, y, z);
  return client.intersectsQuery('features').bounds(bbox[1], bbox[0], bbox[3], bbox[2]).execute();
}

/* Array of features to feature collection */
function fc (features) {
  return {
    type: 'FeatureCollection',
    features: features
  };
}

/* Query features at z,x,y tile */
app.get('/features/:z/:x/:y', function (req, res) {
  var p = req.params;

  queryTile(p.z, p.x, p.y)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.status(500).send('server error!');
    })
});

/* Get vector tiles as protobuf at z,x,y */
app.get('/:z/:x/:y.pbf', function (req, res) {
  var p = req.params;
  var x = parseInt(p.x);
  var y = parseInt(p.y);
  var z = parseInt(p.z);

  queryTile(z, x, y)
    .then(function (data) {
      let features = data.objects.map(dbObj => {
        let feature = dbObj.object;
        let id = dbObj.id;
        feature.properties = Object.assign({}, feature.properties, {'id': id});
        return feature;
      });
      if (features.length > 0) {
        const tileIndex = gvt(fc(features), {indexMaxZoom: z, maxZoom: z});
        const tile = tileIndex.getTile(z, x, y);
        var buf = vtpbf.fromGeojsonVt({ 'geojsonLayer': tile})
        res.writeHead(200, {
          'Content-Type': 'application/x-protobuf'
        });
        res.end(buf)
      } else {
        res.status(404).send()
      }
    })
    .catch(function (err) {
      logger.error(err);
      res.status(500).send('server error');
    })
});

/* Kickoff server */
app.listen(PORT);
