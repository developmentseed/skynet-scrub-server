const logger = require('../utils/logger');
const has = require('has');

class Query {
  constructor (db) {
    this.cur = 0;
    this.db = db;
  }

  cursor (value) {
    this.cursor = value;
    return this;
  }

  objects () {
    return this;
  }

  execute () {
    let self = this;
    return new Promise((resolve, reject) => {
      let keys = Object.keys(self.db.data);
      let nextCursor = self.cur + 100;
      let cursorSet = keys.slice(self.cur, nextCursor);

      let retCursor = (nextCursor > (keys.length - 1)) ? 0 : nextCursor;

      return resolve({
        objects: cursorSet.map((id) => { 
          return {id: id, object: self.db.data[id]};
        }),
        cursor: retCursor,
        count: cursorSet.length
      });
    });
  }
}

class dbMock {
  constructor () {
    this.data = {}
  }

  get (key, id) {
    let self = this;
    return new Promise((resolve, reject) => {
      if (has(self.data, id)) {
        return resolve(this.data[id]);
      } else {
        return reject();
      }
    });
  }

  set(key, id, data) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.data[id] = {id: id, object: data};
      resolve();
    })
  }

  del(key, id) {
    let self = this;
    return new Promise((resolve, reject) => {
      delete self.data[id];
      resolve();
    })
  }

  scanQuery(key) {
    return new Query(this);
  }
}

module.exports.db = dbMock;
