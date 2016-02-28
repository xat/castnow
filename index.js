#!/usr/bin/env node

var player = require('chromecast-player')();
var opts = require('minimist')(process.argv.slice(2));
var chalk = require('chalk');
var keypress = require('keypress');
var ui = require('playerui')();
var circulate = require('array-loop');
var xtend = require('xtend');
var unformatTime = require('./utils/unformat-time');
var debug = require('debug')('castnow');
var debouncedSeeker = require('debounced-seeker');
var noop = function() {};

// plugins
var directories = require('./plugins/directories');
var localfile = require('./plugins/localfile');
var torrent = require('./plugins/torrent');
var transcode = require('./plugins/transcode');
var subtitles = require('./plugins/subtitles');
var stdin = require('./plugins/stdin');

if (opts.help) {
  return console.log([
    '',
    'Usage: castnow [<media>, <media>, ...] [OPTIONS]',
    '',
    'Option                  Meaning',
    '--tomp4                 Convert file to mp4 during playback',
    '--device <name>         The name of the Chromecast device that should be used',
    '--address <ip>          The IP address or hostname of your Chromecast device',
    '--subtitles <path/url>  Path or URL to an SRT or VTT file',
    '--myip <ip>             Your local IP address',
    '--quiet                 No output',
    '--peerflix-* <value>    Pass options to peerflix',
    '--ffmpeg-* <value>      Pass options to ffmpeg',
    '--type <type>           Explicitly set the mime-type (e.g. "video/mp4")',
    '--bypass-srt-encoding   Disable automatic UTF-8 encoding of SRT subtitles',
    '--seek <hh:mm:ss>       Seek to the specified time on start using the format hh:mm:ss or mm:ss',
    '--loop                  Loop over playlist, or file, forever',

    '--help                  This help screen',
    '',
    'Player controls',
    '',
    'Key                     Action',
    'space                   Toggle between play and pause',
    'm                       Toggle mute',
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

if (opts.quiet || process.env.DEBUG) {
  ui.hide();
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
  if (err) {
    ui.hide();
    debug('player error: %o', err);
    console.log(chalk.red(err));
    process.exit();
  }

  var playlist = ctx.options.playlist;
  var volume;

  keypress(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  ctx.once('closed', function() {
    ui.hide();
    console.log(chalk.red('lost connection'));
    process.exit();
  });

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

  var seek = debouncedSeeker(function(offset) {
    if (ctx.options.disableSeek || offset === 0) return;
    var seconds = Math.max(0, (p.getPosition() / 1000) + offset);
    debug('seeking to %s', seconds);
    p.seek(seconds);
  }, 500);

  var updateTitle = function() {
    p.getStatus(function(err, status) {
      if (!status || !status.media ||
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

  var initialSeek = function() {
    var seconds = unformatTime(ctx.options.seek);
    debug('seeking to %s', seconds);
    p.seek(seconds);
  };

  p.on('playing', updateTitle);

  if (!ctx.options.disableSeek && ctx.options.seek) {
    p.once('playing', initialSeek);
  }

  updateTitle();

  var nextInPlaylist = function() {
    if (ctx.mode !== 'launch') return;
    if (!playlist.length) return process.exit();
    p.stop(function() {
      ui.showLabels('state');
      debug('loading next in playlist: %o', playlist[0]);
      p.load(playlist[0], noop);
      var file = playlist.shift();
      if (ctx.options.loop) playlist.push(file)
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
      if(!volume) {
        return;
      } else if (volume.muted) {
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
      if (!volume || volume.level >= 1) return;
      p.setVolume(Math.min(volume.level + 0.05, 1), function(err, status) {
        if (err) return;
        volume = status;
      });
    },

    // volume down
    down: function() {
      if (!volume || volume.level <= 0) return;
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
      seek(-30);
    },

    // Forward, one "seekCount" per press
    right: function() {
      seek(30);
    }
  };

  process.stdin.on('keypress', function(ch, key) {
    if (key && key.name && keyMappings[key.name]) {
      debug('key pressed: %s', key.name);
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
    debug('player status: %s', status);
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

player.use(stdin);
player.use(directories);
player.use(torrent);
player.use(localfile);
player.use(transcode);
player.use(subtitles);

player.use(function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  ctx.options = xtend(ctx.options, ctx.options.playlist[0]);
  var file = ctx.options.playlist.shift();
  if (ctx.options.loop) ctx.options.playlist.push(file);
  next();
});

if (!opts.playlist) {
  debug('attaching...');
  player.attach(opts, ctrl);
} else {
  debug('launching...');
  player.launch(opts, ctrl);
}

process.on('SIGINT', function() {
  process.exit();
});

process.on('exit', function() {
  ui.hide();
});

module.exports = player;
