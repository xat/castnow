var test = require('tape');
var castnow = require('./castnow')();
var ENGINE_STATES = require('./lib/engine').STATES;
var scanner = require('chromecast-scanner');
var Api = require('chromecast-player').api;
var async = require('async');


test('castnow engine', function(t) {
  var engine = castnow.getEngine();

  var item = {

    getAppId: function() {
      return Api.APP_ID;
    },

    getApi: function() {
      return Api;
    },

    load: function(controls, cb) {
      controls.load({
        autoplay: true,
        currentTime: 0,
        media: {
          contentId: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/ED_1280.mp4',
          contentType: 'video/mp4',
          streamType: 'BUFFERED'
        }
      }, cb);
    },

    unload: function(controls, cb) {
      if (controls.destroy) controls.destroy();
      t.pass('item unloaded');
      cb();
    }

  };

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
      engine.load(item, function(err, controls, item) {
        t.equal(err, null, 'there should not be any load error');
        t.equal(engine.getState(), ENGINE_STATES.launched, 'engine should be in launch state')
        next();
      });
    },

    function(next) {
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
