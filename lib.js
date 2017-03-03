/* Imports */
const express = require('express');
const minimist = require('minimist');
const logger = require('./utils/logger');
const morgan = require('morgan');
const boom = require('express-boom');

var client = require('./db');

/* Get command line options */
const argv = minimist(process.argv.slice(2));

/* Globals */
const PORT = argv.port || process.env.PORT || 4030
const ADDR = argv.addr || process.env.ADDR || 'http://localhost:' + PORT
const app = express();

module.exports.init = function () {
  /* Router settings */
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.static('public'));
  app.use(boom());
  app.use(morgan('common'));

  /* Map route */
  app.get('/', function (req, res) {
    res.render('map', {
      accessToken: process.env.TOKEN || argv.token,
      uriPrefix: ADDR
    });
  });


  /* Feature routes */
  const features = require('./routes/features')(client);
  app.get('/features/:z/:x/:y.:format', features.getFeaturesTile);
  app.get('/features/:id.json', features.getFeatureById);

  return app;
}
