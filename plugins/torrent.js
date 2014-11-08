var readTorrent = require('read-torrent');
var peerflix = require('peerflix');
var internalIp = require('internal-ip');
var grabOpts = require('../utils/grab-opts');

var torrent = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  if (ctx.options.playlist.length > 1) return next();
  var path = ctx.options.playlist[0].path;

  if (!/^magnet:/.test(path) &&
      !/torrent$/.test(path) &&
      !ctx.options.torrent) return next();

  readTorrent(path, function(err, torrent) {
    if (err) return next();

    var engine = peerflix(torrent, grabOpts(ctx.options, 'peerflix-'));
    engine.server.once('listening', function() {
      ctx.options.playlist[0] = {
        path: 'http://'+internalIp()+':'+engine.server.address().port,
        type: 'video/mp4',
        media: {
          metadata: {
            title: engine.server.index.name
          }
        }
      };
      next();
    });
  });
};

module.exports = torrent;
