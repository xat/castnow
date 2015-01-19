var readTorrent = require('read-torrent');
var torrentStream = require('torrent-stream');
var internalIp = require('internal-ip');
var debug = require('debug')('castnow:torrent');
var pump = require('pump');
var rangeParser = require('range-parser');
var mime = require('mime');

// the code here is mostly copied together from peerflix.
// all credits go to mafintosh.

var isTorrent = function(path) {
  return /^magnet:/.test(path) || /torrent$/.test(path);
};

var torrent = function(castnow) {
  var router = castnow.getRouter();
  var playlist = castnow.getPlaylist();
  var ip = castnow.getOptions().ip || internalIp();
  var port = castnow.getOptions().port;

  router.get('/torrent/:id', function(req, res) {
    var item = playlist.findItem(parseInt(req.params.id, 10));
    if (!item || !item.get('torrent')) return res.sendStatus(404);
    var file = item.get('file');
    var range = req.headers.range;
    var len = file.length;

    res.setHeader('Content-Type', mime.lookup(file.name));
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!range) {
      res.setHeader('Content-Length', len);
      res.statusCode = 200;
      return pump(file.createReadStream(), res);
    }

    var part = rangeParser(len, range)[0];
    var chunksize = (part.end - part.start) + 1;

    res.setHeader('Content-Range', 'bytes ' + part.start + '-' + part.end + '/' + len);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', chunksize);
    res.statusCode = 206;

    return pump(file.createReadStream(part), res);
  });

  castnow.hook('resolve', function(ev, next, stop) {
    var item = ev.item;
    if (!isTorrent(item.getSource())) return next();

    debug('torrent detected: %s', item.getSource());

    readTorrent(item.getSource(), function(err, torr) {
      if (err) {
        debug('error reading torrent: %o', err);
        return stop(new Error('error reading torrent'));
      }
      var url = 'http://' + ip + ':' + port + '/torrent/' + item.getId();
      item.set('torrent', torr);
      item.setArgs({
        autoplay: true,
        currentTime: 0,
        media: {
          contentId: url,
          contentType: 'video/mp4',
          streamType: 'BUFFERED'
        }
      });
      item.enable();
      stop();
    });
  }, 800);

  // TODO: Clean up stuff, once torrent is finished.

  playlist.hook('load', function(ev, next) {
    var item = ev.item;
    if (!item.get('torrent')) return next();
    var torrentEngine = torrentStream(item.get('torrent'));

    var onReady = function() {
      // extract largest file
      // (this will likely be the video file)
      var file = torrentEngine.files.reduce(function(a, b) {
        return a.length > b.length ? a : b;
      });
      file.select();
      item.set('file', file);
      next();
    };

    if (torrentEngine.torrent) {
      onReady();
    } else {
      torrentEngine.once('ready', onReady);
    }
  });

};

module.exports = torrent;
