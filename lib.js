/* Imports */
const express = require('express');
const logger = require('./utils/logger');
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan');
const boom = require('express-boom');

var client = require('./db');

module.exports.init = function (opts) {
  const app = express();

  /* Router settings */
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.static('public'));
  app.use(compression());
  app.use(bodyParser.json()); // for parsing application/json
  app.use(boom());
  app.use(morgan('common'));

  /* Map route */
  app.get('/', function (req, res) {
    res.render('map', {
      accessToken: opts.token || process.env.TOKEN,
      uriPrefix: opts.addr || process.env.ADDR || 'http://localhost:' + opts.port
    });
  });


  /* Feature routes */
  const features = require('./routes/features')(client);
  app.get('/features', features.getFeatures);
  app.get('/features/:z/:x/:y.:format', features.getFeaturesTile);
  app.get('/features/:id.json', features.getFeatureById);
  app.put('/features/:id.json', features.setFeatureById);
  app.delete('/features/:id.json', features.deleteFeatureById);

  return app;
}
