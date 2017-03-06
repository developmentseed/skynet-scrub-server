/* Imports */
const minimist = require('minimist');
const logger = require('./utils/logger');
const xtend = require('xtend');

/* Get command line options */
const argv = minimist(process.argv.slice(2));
const PORT = argv.port || process.env.PORT || 4030

/* Imports */
const app = require('./lib').init(xtend(argv, {port: PORT}));

/* Kickoff server */
app.listen(PORT, function (err) {
  logger.info('Server listening on port', PORT)
});
