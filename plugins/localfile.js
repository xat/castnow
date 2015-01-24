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

  castnow.addItemCreator('localfile', function(o, cb) {
    var opts = {};
    var item;
    var url;

    if (typeof o === 'string') {
      opts.source = o;
    } else {
      opts = o;
    }

    if (!isFile(opts.source)) return cb(new Error('not a valid file'));

    item = castnow.createBlankItem();
    item.setSource(opts.source);

    url = 'http://' + ip + ':' + options.port + '/localfile/' + item.getId();

    item.setArgs({
      autoplay: true,
      currentTime: opts.start || 0,
      media: {
        contentId: url,
        contentType: 'video/mp4',
        streamType: 'BUFFERED',
        metadata: {
          title: path.basename(item.getSource())
        }
      }
    });
  });

  castnow.hook('resolve', function(ev, next, stop) {
    var input = ev.input;
    if (!isFile(input.source)) return next();
    debug('localfile detected: %s', source);
    castnow.createItem('localfile', input, function(err, item) {
      if (err) return stop(err);
      ev.item = item;
      return stop();
    });
  }, 600);
};

module.exports = localfile;
