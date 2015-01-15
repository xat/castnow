var hoook = require('hoook');
var xtend = require('xtend');

var engine = function(opts) {
  var connection;

  return xtend({

    // connect to chromecast
    connect: function(address) {

    },

    disconnect: function() {

    },

    // launch an app on the
    // connected chromecast
    launch: function(api) {

    },

    // get the current api
    getApi: function() {

    },

    getState: function() {

    },

    // scan for chromecast devices
    scan: function() {

    }

  }, hoook());

};

module.exports = engine;
