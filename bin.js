#!/usr/bin/env node

var castnow = require('./castnow')();
var opts = require('minimist')(process.argv.slice(2));
var attachMode = !opts._.length;
var launchMode = !attachMode;
var scanner = require('chromecast-scanner');
var debug = require('debug')('castnow:bin');
var engine = castnow.getEngine();
var pl = castnow.getPlaylist();

// plugins
var urlPlugin = require('./plugins/url');
var youtubePlugin = require('./plugins/youtube');

var abort = function(message) {
  // stop
};

if (opts.help) {
  // display help message
  return;
}

if (opts.version) {
  // display castnow version
  return;
}

// Load Plugins here...
castnow.use(urlPlugin);
castnow.use(youtubePlugin);

if (opts.check) {
  // - list all chromecast devices found in the network
  // - check if ffmpeg is installed with an supported version
  return;
}

if (launchMode) {
  debug('launch mode');
  castnow.resolve(opts._, function(err, items) {
    if (err) return debug('error resolving items');
    pl.append.apply(pl, items);
    debug('appended items to playlist %s', items.length);
    scanner(function(err, service) {
      if (err) return debug('chromecast not found');
      debug('found chromecast running with address %s', service.address);
      castnow.connect(service.address, function(err) {
        if (err) return debug('chromecast connection failed');
        // load first item in playlist
        pl.load(0, function(err, item, controls) {
          if (err) return debug('load failed with error: %s', err.message);
          debug('load succeeded');
        });
      });
    });
  });
}
