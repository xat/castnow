#!/usr/bin/env node

var player = require('chromecast-player')();
var opts = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var keypress = require('keypress');
var ui = require('playerui')();
var circulate = require('array-loop');
var xtend = require('xtend');
var noop = function() {};

// plugins
var directories = require('./plugins/directories');
var localfile = require('./plugins/localfile');
var torrent = require('./plugins/torrent');
var youtubeplaylist = require('./plugins/youtubeplaylist');
var youtube = require('./plugins/youtube');
var transcode = require('./plugins/transcode');
var subtitles = require('./plugins/subtitles');

if (opts.help) {
  return console.log([
    '',
    'Usage: castnow [<media>, <media>, ...] [OPTIONS]',
    '',
    'Option                  Meaning',
    '--tomp4                 Convert file to mp4 while playback',
    '--device <name>         The name of the chromecast device that should be used',
    '--subtitles <path/url>  Path or URL to an SRT or VTT file',
    '--myip <ip>             Your main IP address',
    '--verbose               No output',
    '--peerflix-* <value>    Pass options to peerflix',
    '--ffmpeg-* <value>      Pass options to ffmpeg',
    '--help                  This help screen',
    '',
    'Player controls',
    '',
    'Key                     Meaning',
    'space                   Toggle between play and pause',
    'm                       Toggle between mute and unmute',
    'up                      Volume Up',
    'down                    Volume Down',
    'left                    Seek backward',
    'right                   Seek forward',
    'n                       Next in playlist',
    's                       Stop playback',
    'quit                    Quit',
    ''
  ].join('\n'));
}

if (opts._.length) {
  opts.playlist = opts._.map(function(item) {
    return {
      path: item
    };
  });
}

delete opts._;

if (opts.verbose) {
  ui.render = noop;
}

ui.showLabels('state');

var last = function(fn, l) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    args.push(l);
    l = fn.apply(null, args);
    return l;
  };
};

var ctrl = function(err, p, ctx) {
  var playlist = ctx.options.playlist;
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

  var changeCurrentSeekCounter = (function() {
    var currentSeekCounter = 0;
    var currentTimeout = 0;
    var perSeek = 30;
    return function(increment) {
      if (ctx.options.disableSeek) return;
      if (increment > 0 && currentSeekCounter < 0
          || increment < 0 && currentSeekCounter > 0)
          currentSeekCounter = 0;

      currentSeekCounter += increment;
      if (currentTimeout !== 0) clearTimeout(currentTimeout);

      currentTimeout = setTimeout(function() {
        if (currentSeekCounter === 0) return;
        p.getStatus(function(err, status) {
          var timeToSeekTo = (currentSeekCounter * perSeek) + status.currentTime;
          p.seek(timeToSeekTo);
          currentSeekCounter = 0;
        });
      }, 500, p);
    };
  })();

  var updateTitle = function() {
    p.getStatus(function(err, status) {
      if (!status.media ||
          !status.media.metadata ||
          !status.media.metadata.title) return;

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

  var nextInPlaylist = function() {
    if (ctx.mode !== 'launch') return;
    if (!playlist.length) return;
    p.stop(function() {
      ui.showLabels('state');
      p.load(playlist[0], noop);
      playlist.shift();
    });
  };

  p.on('status', last(function(status, memo) {
    if (status.playerState !== 'IDLE') return;
    if (status.idleReason !== 'FINISHED') return;
    if (memo && memo.playerState === 'IDLE') return;
    nextInPlaylist();
    return status;
  }));

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
    },

    // next item in playlist
    n: function() {
      nextInPlaylist();
    },

    // stop playback
    s: function() {
      p.stop();
    },

    // quit
    q: function() {
      process.exit();
    },

    // Rewind, one "seekCount" per press
    left: function() {
      changeCurrentSeekCounter(-1);
    },

    // Forward, one "seekCount" per press
    right: function() {
      changeCurrentSeekCounter(1);
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
  ctx.on('status', logState);
  next();
});

player.use(directories);
player.use(torrent);
player.use(localfile);
player.use(youtubeplaylist);
player.use(youtube);
player.use(transcode);
player.use(subtitles);

player.use(function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  ctx.options = xtend(ctx.options, ctx.options.playlist[0]);
  ctx.options.playlist.shift();
  next();
});

if (!opts.playlist) {
  player.attach(opts, ctrl);
} else {
  player.launch(opts, ctrl);
}

module.exports = player;
