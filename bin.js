#!/usr/bin/env node

var castnow = require('./castnow')();
var opts = require('minimist')(process.argv.slice(2));
var attachMode = !opts._.length;
var launchMode = !attachMode;
var engine = castnow.getEngine();
var pl = castnow.getPlaylist();


if (opts.help) {
  // display help message
  return;
}

// Load Plugins here...

if (opts.scan) {
  // list all chromecast devices found in the network
  return;
}

if (launchMode) {
  // add items to playlist
  opts._.forEach(function(path) {
    pl.add(path);
  });
}

castnow.connect(function(err) {
  if (launchMode) {
    return pl.play();
  }
});
