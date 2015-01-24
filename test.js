var test = require('tape');
var castnow = require('./castnow')();
var ENGINE_STATES = require('./lib/engine').STATES;
var scanner = require('chromecast-scanner');
var urlPlugin = require('./plugins/url');
var async = require('async');
var demo = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4';

castnow.use(urlPlugin);

test('castnow engine', function(t) {
  var engine = castnow.getEngine();

  async.waterfall([
    function(next) {
      scanner(function(err, service) {
        if (err) return next(err);
        return next(null, service.address);
      });
    },

    function(address, next) {
      t.equal(engine.getState(), ENGINE_STATES.not_connected, 'engine should not be connected');
      engine.connect(address, function() {
        t.equal(engine.getState(), ENGINE_STATES.connected, 'engine should be connected');
        next();
      });
    },

    function(next) {
      castnow.createItem('url', demo, function(err, item) {
        next(null, item);
      });
    },

    function(item, next) {
      engine.load(item, function(err) {
        t.equal(err, null, 'there should not be any load error');
        t.equal(engine.getState(), ENGINE_STATES.launched, 'engine should be in launch state')
        next(null, item);
      });
    },

    function(item, next) {
      setTimeout(function() {
        engine.load(item, function() {
          next();
        });
      }, 5000);
    },

    function(next) {
      setTimeout(function() {
        engine.close();
        setTimeout(function() {
          t.equal(engine.getState(), ENGINE_STATES.not_connected, 'engine should not be connected');
          next();
        }, 1000);
      }, 5000);
    }

  ],
  function(err) {
    if (err) {
      t.fail(err.message);
    }
    t.end();
  });

});
