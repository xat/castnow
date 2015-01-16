var hoook = require('hoook');
var xtend = require('xtend');
var utils = require('./utils');
var ENGINE_STATES = require('./engine').STATES;
var noop = function() {};

var playlist = function(engine) {
  var cursor = 0;
  var items = [];
  var uniqueId = utils.uniqueId(1);
  var store = utils.store();

  var passControlThrough = function(method) {
    return function(cb) {
      var controls = engine.getControls();
      if (!cb) cb = noop;
      if (!controls) return cb(new Error('engine not ready'));
      controls[method].apply(controls, arguments);
    };
  };

  return xtend({

    init: function() {

    },

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

    // These methods will be directly
    // passed through to the current
    // control instance
    play: passControlThrough('play'),
    pause: passControlThrough('pause'),
    stop: passControlThrough('stop'),
    seek: passControlThrough('seek')

  }, hoook());
};

module.exports = playlist;
