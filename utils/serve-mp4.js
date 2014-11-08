var fs = require('fs');
var util = require('util');
var rangeParser = require('range-parser');
var mime = require('mime');

module.exports = function(req, res, filePath) {
  var stat = fs.statSync(filePath);
  var total = stat.size;
  var range = req.headers.range;
  var type = mime.lookup(filePath);

  res.setHeader('Content-Type', type);
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!range) {
    res.setHeader('Content-Length', total);
    res.statusCode = 200;
    return fs.createReadStream(filePath).pipe(res);
  }

  var part = rangeParser(total, range)[0];
  var chunksize = (part.end - part.start) + 1;
  var file = fs.createReadStream(filePath, {start: part.start, end: part.end});

  res.setHeader('Content-Range', 'bytes ' + part.start + '-' + part.end + '/' + total);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Length', chunksize);
  res.statusCode = 206;

  return file.pipe(res);
};
