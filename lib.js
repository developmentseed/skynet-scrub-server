/* Imports */
const express = require('express');
const logger = require('./utils/logger');
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan');
const boom = require('express-boom');
const cors = require('cors');

var db = require('./db');

module.exports.init = function (opts) {
  const app = express();
  let client = db.init();

  /* Router settings */
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.static('public'));
  app.use(compression());
  app.use(cors());
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
  const commit = require('./routes/commit')(client);
  app.get('/features.json', features.getFeatures);
  app.get('/features/:z/:x/:y.:format', features.getFeaturesTile);
  app.get('/features/:id.json', features.getFeatureById);
  app.put('/features/:id.json', features.setFeatureById);
  app.delete('/features/:id.json', features.deleteFeatureById);
  app.post('/commit', commit.commit);

  return {
    app, client
  };
}
