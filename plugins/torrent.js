var readTorrent = require('read-torrent');
var peerflix = require('peerflix');
var internalIp = require('internal-ip');
var grabOpts = require('../utils/grab-opts');
var debug = require('debug')('castnow:torrent');

var torrent = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  if (ctx.options.playlist.length > 1) return next();
  var path = ctx.options.playlist[0].path;

  var port = ctx.options['torrent-port'] || 4102;

  if (!/^magnet:/.test(path) &&
      !/torrent$/.test(path) &&
      !ctx.options.torrent) return next();

  readTorrent(path, function(err, torrent) {
    if (err) {
      debug('error reading torrent: %o', err);
      return next();
    }
    if (!ctx.options['peerflix-port']) ctx.options['peerflix-port'] = port;
    var engine = peerflix(torrent, grabOpts(ctx.options, 'peerflix-'));
    var ip = ctx.options.myip || internalIp();
    engine.server.once('listening', function() {
      debug('started webserver on address %s using port %s', ip, engine.server.address().port);
      ctx.options.playlist[0] = {
        path: 'http://' + ip + ':' + engine.server.address().port,
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
