var hoook = require('hoook');
var xtend = require('xtend');
var Client = require('castv2-client').Client;
var noop = function() {};

var STATES = {
  not_connected: 1,
  connected: 2,
  launched: 4
};

var engine = function(opts) {
  var client = new Client();
  var state = STATES.not_connected;
  var controls;

  var setState = function(s) {
    eng.fire('state_change', { from: state, to: s }, function() {
      state = s;
    });
  };

  var onStateChange = function(ev) {
    if (ev.from === STATES.launched && ev.to < STATES.launched) {
      controls = void 0;
    }
  };

  var onError = function() {
    setState(STATES.not_connected);
    client.close();
  };

  client.on('error', onError);

  var eng = xtend({

    // connect to chromecast
    connect: function(address, cb) {
      if (!cb) cb = noop;
      client.connect(address, function() {
        setState(STATES.connected);
        cb(null, client);
      });
    },

    disconnect: function() {
      if (state === STATES.not_connected) return false;
      setState(STATES.not_connected);
      client.close();
    },

    // launch an app on the
    // connected chromecast
    launch: function(api, cb) {
      if (!cb) cb = noop;
      if (state === STATES.not_connected) {
        return cb(new Error('not connected'));
      }
      this.fire('launch', { api: api }, function(err, ev) {
        if (err) return cb(err);
        client.launch(ev.api, function(err, inst) {
          if (err) return cb(err);
          eng.fire('launched', { controls: inst });
          setState(STATES.launched);
          controls = inst;
          cb(null, controls);
        });
      });
    },

    // find running apps on chromecast
    find: function(cb) {
      if (!cb) cb = noop;
      if (state === STATES.not_connected) {
        return cb(new Error('not connected'));
      }
      client.getSessions(function(err, apps) {
        if (err) return cb(err);
        if (!apps.length) return cb(new Error('app not found'));
        cb(null, apps[0]);
      });
    },

    // join a running playback session
    join: function(session, api, cb) {
      if (!cb) cb = noop;
      if (state === STATES.not_connected) {
        return cb(new Error('not connected'));
      }
      if (state === STATES.launched) {
        return cb(new Error('already joined'));
      }
      client.join(session, api, function(err, inst) {
        if (err) return cb(err);
        eng.fire('joined', { controls: inst });
        setState(STATES.launched);
        controls = inst;
      });
    },

    // get the current controller instance
    getControls: function() {
      return controls;
    },

    getState: function() {
      return state;
    }

  }, hoook());

  eng.hook('state_change', onStateChange);

  return eng;
};

engine.STATES = STATES;

module.exports = engine;
