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
  var youtubeId = getYouTubeId(options.path);
  debug('loading video with id %s', youtubeId);
  var opts = {
    type: 'flingVideo',
    data: {
      currentTime: 0,
      videoId: youtubeId
    }
  };
  this.ytreq.request(opts);
  if (cb) cb();
};

var youtube = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  if (!getYouTubeId(ctx.options.playlist[0].path)) return next();
  debug('using youtube api');
  ctx.api = Yt;
  next();
};

module.exports = youtube;
