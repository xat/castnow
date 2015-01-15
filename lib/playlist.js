var hoook = require('hoook');
var xtend = require('xtend');
var utils = require('./utils');
var noop = function() {};

var playlist = function(engine) {
  var cursor = 0;
  var items = [];
  var uniqueId = utils.uniqueId(1);
  var store = utils.store();

  return xtend({

    // add a new item
    add: function(path) {
      this.fire('add', { path: path, id: uniqueId() },
        function(err, item) {
          if (err) return;
          store.set(item.id, item);
          items.push(item);
        }
      );
    },

    // jump to next item
    next: function() {

    },

    // load the prev item
    prev: function() {

    },

    play: function(cb) {
      var api;
      cb = cb || noop;

      if (engine.getState() !== 'launched') {
        return cb(new Error('engine not ready'));
      }

      api = engine.getApi();
      api.play.apply(api, arguments);
    },

    pause: function() {

    },

    stop: function() {

    },

    seek: function() {

    }

  }, hoook());
};

module.exports = playlist;
