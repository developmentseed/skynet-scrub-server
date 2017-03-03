/* Imports */
const minimist = require('minimist');
const logger = require('./utils/logger');

/* Get command line options */
const argv = minimist(process.argv.slice(2));

/* Imports */
const app = require('./lib').init(argv);

/* Kickoff server */
const PORT = argv.port || process.env.PORT || 4030
app.listen(PORT, function (err) {
  logger.info('Server listening on port', PORT)
});
