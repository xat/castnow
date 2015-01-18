var Api = require('chromecast-player').api;
var castv2Cli = require('castv2-client');
var RequestResponseController = castv2Cli.RequestResponseController;
var inherits = require('util').inherits;
var getYouTubeId = require('get-youtube-id');
var debug = require('debug')('castnow:youtube');

var Yt = function() {
  Api.apply(this, arguments);
  this.ytreq = this.createController(RequestResponseController,
    'urn:x-cast:com.google.youtube.mdx');
};

Yt.APP_ID = '233637DE';

inherits(Yt, Api);

Yt.prototype.load = function(options, cb) {
  this.ytreq.request(options);
  if (cb) cb();
};

var youtube = function(castnow) {

  castnow.hook('resolve', function(ev, next, stop) {
    var item = ev.item;
    var youtubeId = getYouTubeId(item.getSource());
    if (!youtubeId) return next();
    debug('youtube url detected %s', item.getSource());

    item.setApi('youtube', Yt);

    item.setArgs({
      type: 'flingVideo',
      data: {
        currentTime: 0,
        videoId: youtubeId
      }
    });

    item.enable();
    stop();
  }, 1000);

};

module.exports = youtube;
