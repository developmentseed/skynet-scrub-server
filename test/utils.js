function dbMock() {
  this.data = {}
}

dbMock.prototype.get = function (id) {
  let self = this;
  return new Promise((resolve, reject) => {
    if (has(self.data, id)) {
      resolve(this.data[id]);
    } else {
      reject();
    }
  });
}

dbMock.prototype.set = function (id, data) {
  let self = this;
  return new Promise((resolve, reject) => {
    self.data[id] = data;
    resolve();
  })
}

module.exports.db = dbMock;
