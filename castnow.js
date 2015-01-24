var playlist = require('./lib/playlist');
var engine = require('./lib/engine');
var itemBuilder = require('./lib/itembuilder');
var utils = require('./lib/utils');
var xtend = require('xtend');
var isArray = require('util').isArray;
var express = require('express');
var async = require('async');
var hoook = require('hoook');
var debug = require('debug')('castnow');
var noop = function() {};

var defaults = {
  port: 7373
};

var castnow = function(opts) {
  var eng = engine();
  var pl = playlist(eng);
  var router = express.Router();
  var uniqueId = utils.uniqueId(1);
  var options = xtend(defaults, opts || {});
  var app = express();
  var flatteners = {};
  var itemCreators = {};
  var cn;

  var flatten = function(input, cb) {
    if (!cb) cb = noop;
    // the flatten-hook can be used to extract
    // the items of a playlist-like input (e.g. .m3u)
    cn.fire('flatten',  { input: input },
      function(err, ev) {
        if (err) return cb(err);
        cb(null, isArray(ev.input) ? ev.input : [ev.input]);
      }
    );
  };

  var resolver = function(input, cb) {
    if (!cb) cb = noop;
    cn.fire('resolve', input, function(err, ev) {
      if (err) return cb(err);
      cb(null, ev.item || null);
    });
  };

  app.use(router);
  app.listen(options.port);

  return cn = xtend({

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

    // resolve is used to transform some input
    // into an item that can be added to the
    // playlist
    resolve: function(input, cb) {
      if (!cb) cb = noop;
      var that = this;
      var inputs = isArray(input) ? input : [input];

      async.concat(inputs, flatten, function(err, list) {
        if (err) cb(err);
        async.mapSeries(list, resolver, function(err, items) {
          if (err) return cb(err);
          items = items.filter(function(item) {
            return !!item;
          });
          cb(null, items);
        });
      });
    },

    getOptions: function() {
      return options;
    },

    createBlankItem: function() {
      return itemBuilder(uniqueId());
    },

    createItem: function(name, options, cb) {
      if (!itemCreators[name]) return cb(new Error('creator not found'));
      itemCreators[name](options, cb);
    },

    flatten: function(name, options, cb) {
      if (!flatteners[name]) return cb(new Error('flattener not found'));
      flatteners[name](options, cb);
    },

    addItemCreator: function(name, fn) {
      itemCreators[name] = fn;
    },

    addFlattener: function(name, fn) {
      flattener[name] = fn;
    },

    // register a plugin
    use: function(fn) {
      fn(this);
      return this;
    }

  }, hoook());

};

module.exports = castnow;
