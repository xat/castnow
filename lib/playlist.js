var hoook = require('hoook');
var xtend = require('xtend');
var utils = require('./utils');
var find = require('array-find');
var noop = function() {};
var ENGINE_STATES = require('./engine').STATES;

var STATES = {
  not_loaded: 1,
  loaded: 2
};

var playlist = function(engine) {
  var items = [];
  var uniqueId = utils.uniqueId(1);
  var cursor;
  var pl;

  return pl = xtend({

    load: function(pos, cb) {
      if (!cb) cb = noop;
      if (typeof pos === 'undefined') pos = 0;
      if (typeof items[pos] === 'undefined') {
        return cb(new Error('out of range'));
      }
      if (engine.getState() === ENGINE_STATES.not_connected) {
        return cb(new Error('engine not connected'));
      }

      engine.load(items[pos], function(err, controls, item) {
        if (err) return cb(err);
        cursor = pos;
        cb(null, controls, item);
      });
    },

    append: function() {
      items.push.apply(items, arguments);
    },

    prepend: function() {
      items.unshift.apply(items, arguments);
    },

    move: function(from, to) {

    },

    remove: function(pos) {

    },

    getCurrent: function() {
      if (typeof cursor === 'undefined') return false;
      return items[cursor];
    },

    count: function() {
      return items.length;
    },

    // load the next item
    next: function(cb) {
      if (!cb) cb = noop;
      if (!items.length) return cb(new Error('playlist is empty'));
      if (typeof cursor === 'undefined') {
        // load first
        return this.load(0, cb);
      }
      if (this.hasNext()) {
        return this.load(cursor+1, cb);
      }
      cb(new Error('next item does not exist'));
    },

    // load the prev item
    prev: function(cb) {
      if (!cb) cb = noop;
      if (!items.length) return cb(new Error('playlist is empty'));
      if (this.hasPrev()) {
        return this.load(cursor-1, cb);
      }
      cb(new Error('prev item does not exist'));
    },

    hasNext: function() {
      if (typeof cursor === 'undefined') return false;
      return (cursor+1) < items.length;
    },

    hasPrev: function() {
      if (typeof cursor === 'undefined') return false;
      return cursor > 0;
    },

    // find an item by its id
    findItem: function(id) {
      return find(items, function(item) {
        return item.getId() === id;
      });
    }

  }, hoook());
};

playlist.STATES = STATES;

module.exports = playlist;
