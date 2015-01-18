var http = require('http');
var internalIp = require('internal-ip');
var path = require('path');
var serveMp4 = require('../lib/serve-mp4');
var debug = require('debug')('castnow:localfile');
var fs = require('fs');

var isFile = function(path) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
};

var localfile = function(castnow) {
  var options = castnow.getOptions();
  var router = castnow.getRouter();
  var playlist = castnow.getPlaylist();
  var ip = options.ip || internalIp();

  router.get('/localfile/:id', function(req, res) {
    var item = playlist.findItem(parseInt(req.params.id, 10));
    if (!item) return res.sendStatus(404);
    debug('incoming request serving %s', item.getSource());
    serveMp4(req, res, item.getSource());
  });

  castnow.hook('resolve', function(ev, next, stop) {
    var item = ev.item;
    if (!isFile(item.getSource())) return next();
    var url = 'http://' + ip + ':' + options.port + '/localfile/' + item.getId();

    debug('localfile detected: %s url: %s', item.getSource(), url);

    item.setArgs({
      autoplay: true,
      currentTime: 0,
      media: {
        contentId: url,
        contentType: 'video/mp4',
        streamType: 'BUFFERED',
        metadata: {
          title: path.basename(item.getSource())
        }
      }
    });

    item.enable();
    stop();
  }, 600);
};

module.exports = localfile;
