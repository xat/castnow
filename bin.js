#!/usr/bin/env node

var castnow = require('./castnow')();
var opts = require('minimist')(process.argv.slice(2));
var attachMode = !opts._.length;
var launchMode = !attachMode;
var engine = castnow.getEngine();
var pl = castnow.getPlaylist();

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

if (opts.check) {
  // - list all chromecast devices found in the network
  // - check if ffmpeg is installed with an supported version
  return;
}

if (launchMode) {
  // add items to playlist
  opts._.forEach(function(path) {
    pl.add(path);
  });
}

castnow.init(function(err) {
  if (err) return abort();

  if (launchMode) {
    return pl.init();
  }

  engine.attach();
});
