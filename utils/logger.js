const logger = require('winston');

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { 'timestamp': true, level: 'debug', colorize: true });

module.exports = logger;
