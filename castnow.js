var playlist = require('./lib/playlist');
var engine = require('./lib/engine');
var xtend = require('xtend');

var castnow = function() {
  var eng = engine();
  var pl = playlist(eng);

  return {

    getEngine: function() {
      return eng;
    },

    getPlaylist: function() {
      return pl;
    },

    // get an express router which
    // can be used by all plugins.
    getRouter: function() {

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

  };

};

module.exports = castnow;
