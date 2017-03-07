const tile38 = require('tile38');

function clientInit (opts) {
  let domain = opts.domain || 'localhost:9851';
  let [host, port] = domain.split(':');
  return new tile38()({
    host,
    port
  });
}

module.exports = {
  init: clientInit
}

