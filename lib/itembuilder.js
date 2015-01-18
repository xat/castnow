var player = require('chromecast-player');

var itemBuilder = function(id, source) {
  var data = {};
  var type = 'default'; // e.g. 'youtube'
  var api = player.api;
  var args = {};
  var disabled = true;

  return {

    getId: function() {
      return id;
    },

    setApi: function(t, a) {
      type = t;
      api = a;
    },

    getApi: function() {
      return api;
    },

    getType: function() {
      return type;
    },

    setArgs: function(a) {
      args = a;
    },

    getArgs: function() {
      return args;
    },

    getSource: function() {
      return source;
    },

    enable: function() {
      disabled = false;
    },

    disable: function() {
      disabled = true;
    },

    isDisabled: function() {
      return disabled;
    },

    set: function(key, val) {
      data[key] = val;
    },

    get: function(key) {
      return data[key];
    }

  }
};

module.exports = itemBuilder;
