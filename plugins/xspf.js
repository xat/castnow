var path = require('path');
var debug = require('debug')('castnow:localfile');
var fs = require('fs');
var xspfr = require('xspfr');

var isFile = function(item) {
  return fs.existsSync(item.path) && fs.statSync(item.path).isFile();
}
var isXspf = function(item) {
  return path.extname(item.path) === '.xspf';
};

var contains = function(arr, cb) {
  for (var i=0, len=arr.length; i<len; i++) {
    if (cb(arr[i], i)) return true;
  }
  return false;
};

var flatten1 = function(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays);
}

var localfile = function(ctx, next) {
  if (ctx.mode !== 'launch') return next();
  if (!contains(ctx.options.playlist, isXspf)) return next();

  var list = ctx.options.playlist.slice(0);

  Promise.all(list.map(function(item, idx) {
    if (!isXspf(item)) {
      return Promise.resolve([item]);
    }

    if (!isFile(item)) {
      // TODO
      throw 'Unsupported external XSPF links';
    }

    return new Promise(function(resolve, reject) {
      xspfr(fs.readFileSync(item.path).toString(), function(err, result) {
        if(err) reject(err)

        resolve(result.map(function(item) {
          return {
            path: item.location,
            media: {
              metadata: {
                title: item.title
              }
            }
          }
        }))
      })
    })

  })).then(function(data) {
    ctx.options.playlist = flatten1(data);
    next()
  })
};

module.exports = localfile;
