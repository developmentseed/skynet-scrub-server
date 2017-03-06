const logger = require('../utils/logger');
const has = require('has');

function dbMock() {
  this.data = {}
}

dbMock.prototype.get = function (key, id) {
  let self = this;
  return new Promise((resolve, reject) => {
    if (has(self.data, id)) {
      return resolve(this.data[id]);
    } else {
      return reject();
    }
  });
}

dbMock.prototype.set = function (key, id, data) {
  let self = this;
  return new Promise((resolve, reject) => {
    self.data[id] = {id: id, object: data};
    resolve();
  })
}

dbMock.prototype.del = function (key, id) {
  let self = this;
  return new Promise((resolve, reject) => {
    delete self.data[id];
    resolve();
  })
}

module.exports.db = dbMock;
