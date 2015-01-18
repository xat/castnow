var hoook = require('hoook');
var xtend = require('xtend');
var utils = require('./utils');
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

  var passControlThrough = function(method) {
    return function(cb) {
      var controls = engine.getControls();
      if (!cb) cb = noop;
      if (!controls) return cb(new Error('engine not ready'));
      controls[method].apply(controls, arguments);
    };
  };

  return pl = xtend({

    load: function(pos, cb) {
      if (!cb) cb = noop;
      if (typeof pos === 'undefined') pos = 0;
      if (typeof items[pos] === 'undefined') {
        return cb(new Error('out of range'));
      }
      if (engine.getState() === ENGINE_STATES.not_connected) {
        return (cb(new Error('engine not connected')));
      }
      this.fire('load', { item: items[pos] },
        function(err, ev) {
          if (err) return cb(err);
          var current = pl.getCurrent();
          if (current && current.getType() === ev.item.getType()) {
            // the last item was of the same type.
            // we can stay on the chromecast app
            engine.getControls().load(ev.item.getArgs(), function(err) {
              if (err) return cb(err);
              cb(null, ev.item, engine.getControls());
            });
          } else {
            engine.launch(ev.item.getApi(), function(err, controls) {
              if (err) return cb(err);
              controls.load(ev.item.getArgs(), function(err) {
                if (err) return cb(err);
                cb(null, ev.item, controls);
              });
            });
          }
        }
      );
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

    // jump to next item
    next: function(cb) {
      
    },

    // load the prev item
    prev: function(cb) {

    },

    // These methods will be directly
    // passed through to the current
    // control instance
    play: passControlThrough('play'),
    pause: passControlThrough('pause'),
    seek: passControlThrough('seek'),
    stop: passControlThrough('stop')

  }, hoook());
};

playlist.STATES = STATES;

module.exports = playlist;
