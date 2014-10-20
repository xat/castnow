#!/usr/bin/env node

var player = require('chromecast-player')();
var opts = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var keypress = require('keypress');
var log = require('single-line-log').stdout;

// Plugins
var localfile = require('./plugins/localfile');
var torrent = require('./plugins/torrent');
var youtube = require('./plugins/youtube');

if (opts._.length) {
  opts.path = opts._[0];
}

delete opts._;

var ctrl = function(err, p, ctx) {
  if (err) {
    console.log(chalk.red(err));
    process.exit();
  }

  keypress(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  var isPlaying = function() {
    return p.currentSession.playerState === 'PLAYING';
  };

  process.stdin.on('keypress', function(ch, key) {
    if (key.name === 'space') {
      if (isPlaying()) {
        p.pause();
      } else {
        p.play();
      }
    }
    if (key && key.ctrl && key.name == 'c') {
      process.exit();
    }
  });

};

var circulate = function(arr) {
  var len = arr.length, pos = -1;
  return !len ? void 0 : function() {
    return arr[pos = ++pos % len];
  }
};

var logState = (function() {
  var inter;
  var dots = circulate(['.', '..', '...', '....']);
  return function(status) {
    if (inter) clearInterval(inter);
    inter = setInterval(function() {
      log(chalk.grey('player status: ') + chalk.green(status + dots()) + "\n");
    }, 300);
  };
})();

player.use(function(ctx, next) {
  ctx.on('status', logState)
  next();
});

player.use(torrent);
player.use(localfile);
player.use(youtube);

if (!opts.path) {
  player.attach(opts, ctrl);
} else {
  player.launch(opts, ctrl);
}

module.exports = player;
