var playlist = require('./lib/playlist');
var engine = require('./lib/engine');
var xtend = require('xtend');
var express = require('express');
var hoook = require('hoook');
var noop = function() {};

var defaults = {
  port: 7373
};

var castnow = function(opts) {
  var eng = engine();
  var pl = playlist(eng);
  var initialized = false;
  var router = express.Router();
  var options = xtend(defaults, opts || {});

  return xtend({

    init: function(cb) {
      if (!cb) cb = noop;
      if (initialized) return cb(new Error('already initialized'));
      this.fire('init', function() {
        var app = express();
        app.use(router);
        app.listen(options.port);
        cb();
      });
    },

    getEngine: function() {
      return eng;
    },

    getPlaylist: function() {
      return pl;
    },

    // get an express router which
    // can be used by all plugins.
    getRouter: function() {
      return router;
    },

    // connect to chromecast
    connect: function() {
      eng.connect.apply(null, arguments);
    },

    // register a plugin
    use: function(fn) {
      fn(this);
      return this;
    }

  }, hoook());

};

module.exports = castnow;
