var Api = require('chromecast-player').api;
var castv2Cli = require('castv2-client');
var RequestResponseController = castv2Cli.RequestResponseController;
var inherits = require('util').inherits;
var getYouTubeId = require('get-youtube-id');

var Yt = function() {
  Api.apply(this, arguments);
  this.ytreq = this.createController(RequestResponseController,
    'urn:x-cast:com.google.youtube.mdx');
};

Yt.APP_ID = '233637DE';

inherits(Yt, Api);

Yt.prototype.load = function(opts, cb) {
  var opts = {
    type: 'flingVideo',
    data: {
      currentTime: 0,
      videoId: opts.path
    }
  };
  this.ytreq.request(opts);
  cb();
};

var youtube = function(ctx, next) {
  if (ctx.mode === 'attach') return next();
  var id = getYouTubeId(ctx.options.path);
  if (!id) return next();
  ctx.api = Yt;
  ctx.options.path = id;
  next();
};

module.exports = youtube;
