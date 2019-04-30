'use strict';

const Database = require('nedb');
const define = require('../lib/define');

const databasePath = define.rootPath + "/.Jukeboks/bookmarks.json";
let db = new Database({ filename: databasePath, autoload: true });
// let db = new Database();
db.ensureIndex({ fieldName: 'path', unique: true }, function (err) {});

class Bookmarker {

  create(path, callback) {
    this.select(path, function(doc) {
      if (doc) {
        db.update({ path: path},
          { $set: { createdAt: Date.now() } },
          {},
          function(err, replaced) {
            callback(replaced, true);
          }
        );
        return;
      }

      let newDoc = {
        path: path,
        createdAt: Date.now()
      };
      db.insert(newDoc);
      callback(newDoc, false);
    });
  }

  select(path, callback) {
    db.findOne({ path: path }, function (err, doc) {
      callback(doc);
    });
  }

  has(path, callback) {
    this.select(path, (doc) => {
      callback(doc != null);
    });
  }

  selectAll(callback) {
    db.find({}).sort({ createdAt: -1 }).exec(function (err, docs) {
      callback(docs);
    });
  }

  remove(path, callback) {
    db.remove({ path: path }, {}, function (err, numRemoved) {
      callback();
    });
  }

}

module.exports = new Bookmarker();
