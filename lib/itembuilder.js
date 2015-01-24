var player = require('chromecast-player');

var itemBuilder = function(id) {
  var data = {};
  var api = player.api;
  var appId = api.APP_ID;
  var args = {};

  return {

    getId: function() {
      return id;
    },

    setApi: function(a) {
      api = a;
    },

    getApi: function() {
      return api;
    },

    setAppId: function(id) {
      appId = id;
    },

    getAppId: function() {
      return appId;
    },

    setArgs: function(a) {
      args = a;
    },

    getArgs: function() {
      return args;
    },

    setSource: function(src) {
      source = src;
    },

    getSource: function() {
      return source;
    },

    set: function(key, val) {
      data[key] = val;
    },

    get: function(key) {
      return data[key];
    },

    load: function(controls, cb) {
      controls.load(this.getArgs(), cb);
    },

    unload: function(controls, cb) {
      if (controls.destroy) controls.destroy();
      cb();
    }

  }
};

module.exports = itemBuilder;
