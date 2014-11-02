#!/usr/bin/env node

var player = require('chromecast-player')();
var opts = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var keypress = require('keypress');
var log = require('single-line-log').stdout;
var ui = require('playerui')();
var circulate = require('array-loop');

// plugins
var localfile = require('./plugins/localfile');
var torrent = require('./plugins/torrent');
var youtube = require('./plugins/youtube');
var transcode = require('./plugins/transcode');

if (opts._.length) {
  opts.path = opts._[0];
  opts.subtitles = opts._[1];
}

delete opts._;

ui.showLabels('state');

var ctrl = function(err, p, ctx) {
  var volume;

  if (err) {
    console.log(chalk.red(err));
    process.exit();
  }

  keypress(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  // get initial volume
  p.getVolume(function(err, status) {
    volume = status;
  });

  if (!ctx.options.disableTimeline) {
    p.on('position', function(pos) {
      ui.setProgress(pos.percent);
      ui.render();
    });
  }

  var updateTitle = function() {
    p.getStatus(function(err, status) {
      if (!status.media || !status.media.metadata
          || !status.media.metadata.title) return;
      var metadata = status.media.metadata;
      var title;
      if (metadata.artist) {
        title = metadata.artist + ' - ' + metadata.title;
      } else {
        title = metadata.title;
      }
      ui.setLabel('source', 'Source', title);
      ui.showLabels('state', 'source');
      ui.render();
    });
  };

  p.on('playing', updateTitle);
  updateTitle();

  var keyMappings = {

    // toggle between play / pause
    space: function() {
      if (p.currentSession.playerState === 'PLAYING') {
        p.pause();
      } else if (p.currentSession.playerState === 'PAUSED') {
        p.play();
      }
    },

    // toggle between mute / unmute
    m: function() {
      if (volume.muted) {
        p.unmute(function(err, status) {
          if (err) return;
          volume = status;
        });
      } else {
        p.mute(function(err, status) {
          if (err) return;
          volume = status;
        });
      }
    },

    // volume up
    up: function() {
      if (volume.level >= 1) return;
      p.setVolume(Math.min(volume.level + 0.05, 1), function(err, status) {
        if (err) return;
        volume = status;
      });
    },

    // volume down
    down: function() {
      if (volume.level <= 0) return;
      p.setVolume(Math.max(volume.level - 0.05, 0), function(err, status) {
        if (err) return;
        volume = status;
      });
    }

  };

  process.stdin.on('keypress', function(ch, key) {
    if (key && key.name && keyMappings[key.name]) {
      keyMappings[key.name]();
    }
    if (key && key.ctrl && key.name == 'c') {
      process.exit();
    }
  });
};

var capitalize = function(str) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
};

var logState = (function() {
  var inter;
  var dots = circulate(['.', '..', '...', '....']);
  return function(status) {
    if (inter) clearInterval(inter);
    inter = setInterval(function() {
      ui.setLabel('state', 'State', capitalize(status) + dots());
      ui.render();
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
player.use(transcode);

player.use(function(ctx, next) {
  if (!ctx.options.type) ctx.options.type = 'video/mp4';
  next();
});

if (!opts.path) {
  player.attach(opts, ctrl);
} else {
  player.launch(opts, ctrl);
}

module.exports = player;
