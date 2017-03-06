const logger = require('../utils/logger');
const has = require('has');

module.exports = function (client) {
  return {
    commit: async (req, res) => {
      if (!has(req.body, 'edited') && !has(req.body, 'deleted')) {
        return res.boom.badRequest('bad commit');
      }
      let {edited, deleted} = req.body;
      
      try {
        if (edited) {
          let editedPromises = edited.map(feature => {
            let id = feature.properties.id;
            delete feature.properties.id;
            return client.set('features', id, feature);
          });
          let editedRes = await Promise.all(editedPromises);
        }
        if (deleted) {
          let deletedPromises = deleted.map(id => {
            return client.del('features', id);
          });
          let deletedRes = await Promise.all(deletedPromises);
        }
      } catch (err) {
        logger.error(err);
        res.boom.badImplementation('Server error!');
      }

      return res.status(200).send('ok');
    }
  }
}
