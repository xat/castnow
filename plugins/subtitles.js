var http = require('http')
var fs = require('fs')
var getPort = require('get-port');
var srt2vtt = require('srt2vtt');
var internalIp = require('internal-ip');

var srtToVtt = function(sourceFile, destFile) {
  var srtFileContent = fs.readFileSync(sourceFile);
  srt2vtt(srtFileContent, function(err, data) {
    fs.writeFileSync(destFile, data);
  });
};

var attachSubtitles = function(ctx) {

  ctx.options.media.tracks = [{
    trackId: 1,
    type: 'TEXT',
    trackContentId: ctx.options.subtitles,
    trackContentType: 'text/vtt',
    name: 'English',
    language: 'en-US',
    subtype: 'SUBTITLES'
  }];

  ctx.options.media.textTrackStyle = {
    backgroundColor: '#FFFFFF00'
  };

  ctx.options.activeTrackIds = [1];
}

/*
** Handles subtitles, the process is the following:
**  - Is there subtitles in the command line ?
**  - Is there a media defined ?
**  - Are those subtitles stored locally (.srt) or on a distant server (.vtt) ?
**  - If they are stored remotely they are read remotely.
**  - If they are stored locally we need to convert and serve them via http.
*/
var subtitles = function(ctx, next) {
  if (!ctx.options.subtitles) return next();
  if (!ctx.options.media) ctx.options.media = {};

  var path = ctx.options.subtitles;

  if (!(fs.existsSync(path))) {
    // assume it's a HTTP URL.
    // Maybe we need to explicity check?
    attachSubtitles(ctx);
    return next();
  }

  var newpath = path + '.vtt';
  srtToVtt(path, newpath);
  path = newpath;

  fs.readFile(path, 'binary', function(err, file) {
    getPort(function(err, port) {
      if (err) return next();
      var addr = 'http://' + internalIp() + ':' + port;

      http.createServer(function(req, res) {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Content-Length': file.length,
          'Content-type': 'text/vtt;charset=utf-8'
        });

        res.end(file);
      }).listen(port);

      ctx.options.subtitles = addr;
      attachSubtitles(ctx);
      next();
    });
  });

}

module.exports = subtitles;
