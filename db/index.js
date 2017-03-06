const tile38 = require('tile38');
const client = new tile38({
  host: process.env.DB_HOST || 'localhost'
});

module.exports = client;

