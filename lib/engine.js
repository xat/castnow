var hoook = require('hoook');
var xtend = require('xtend');
var Client = require('castv2-client').Client;
var async = require('async');
var noop = function() {};

var STATES = {
  not_connected: 1,
  connected: 2,
  launched: 4
};

var engine = function(opts) {
  var client = new Client();
  var state = STATES.not_connected;
  var loading = false;
  var currentItem;
  var currentControls;

  // set the current item and controls
  var setCurrent = function(item, controls) {
    eng.fire('set_item', { item: item, controls: controls });
    currentItem = item;
    currentControls = controls;
  };

  // unset the current item and controls
  var unsetCurrent = function() {
    eng.fire('unset_item', { item: currentItem, controls: currentControls });
    currentItem = null;
    currentControls = null;
  };

  var setState = function(newState) {
    eng.fire('state_change', { from: state, to: newState });
    state = newState;
  };

  // close the client connection
  // if an error occurs.
  var onError = function() {
    client.close();
  };

  // onClose get's called if the client
  // looses connection to chromecast.
  var onClose = function() {
    setState(STATES.not_connected);
    loading = false;
    if (currentItem) {
      currentItem.unload(currentControls, unsetCurrent);
    } else {
      unsetCurrent();
    }
  };

  var onStatus = function(status) {
    var apps = status.applications;
    if (!apps || loading) return;
    if (!currentItem) return;
    if (currentItem.getAppId() !== apps[0].appId) {
      // we will reach this point here if
      // media playback was started with castnow
      // and while playback the user suddenly casts
      // something else with an other app.
      setState(STATES.connected);
      eng.fire('out_of_sync');
      currentItem.unload(currentControls, unsetCurrent);
    }
  };

  client.on('error', onError);
  client.client.on('close', onClose);
  client.on('status', onStatus);

  var eng = xtend({

    // connect to chromecast
    connect: function(address, cb) {
      if (!cb) cb = noop;
      client.connect(address, function() {
        setState(STATES.connected);
        cb(null, client);
      });
    },

    // close a connection
    close: function() {
      if (state === STATES.not_connected) return;
      client.close();
    },

    // load an new item
    load: function(item, attach, cb) {
      if (arguments.length === 2) {
        cb = attach;
        attach = false;
      }
      if (!cb) cb = noop;
      if (state === STATES.not_connected) {
        return cb(new Error('not connected'));
      }
      if (loading) {
        return cb(new Error('load already in progress'));
      }
      loading = true;

      async.waterfall([

        // unload previous item
        function(next) {
          if (!currentItem) return next();
          currentItem.unload(currentControls, function(err) {
            if (err) return next(err);
            unsetCurrent();
            next();
          });
        },

        // get the currently running appId
        function(next) {
          client.getSessions(function(err, apps) {
            if (err) return next(err);
            if (!apps.length) return next(null, null);
            next(null, apps[0]);
          });
        },

        // launch or attach
        function(session, next) {
          if (!session || session.appId !== item.getAppId()) {
            // launch
            eng.fire('launch', { item: item }, function(err) {
              if (err) return next(err);
              client.launch(item.getApi(), next);
            });
          } else {
            // attach
            eng.fire('join', { item: item }, function(err) {
              if (err) return next(err);
              client.join(session, item.getApi(), next);
            });
          }
        },

        // load the item
        function(controls, next) {
          setState(STATES.launched);
          setCurrent(item, controls);

          if (attach) return next(null, controls);

          eng.fire('load', { item: item, controls: controls }, function(err) {
            if (err) return cb(err);
            item.load(controls, function(err) {
              if (err) return next(err);
              next(null, controls);
            });
          });
        }

      ], function(err, controls) {
        loading = false;
        if (err) return cb(err);
        cb(null, item, controls);
      });

    },

    // join a running playback session
    join: function(item, cb) {
      return this.load(item, true, cb);
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

    // get the current controlls
    getControls: function() {
      return currentControls;
    },

    // get the current loaded item
    getItem: function() {
      return currentItem;
    },

    hasItem: function() {
      return !!currentItem;
    },

    getState: function() {
      return state;
    },

    // if an item is currently getting loaded
    isLoading: function() {
      return loading;
    }

  }, hoook());

  return eng;
};

engine.STATES = STATES;

module.exports = engine;
