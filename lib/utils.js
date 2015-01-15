
var unformatTime = function(str) {
  var timeArray = str.split(':'),
  seconds = 0;
  // turn hours and minutes into seconds and add them all up
  if (timeArray.length === 3) {
    // hours
    seconds = seconds + (parseInt(timeArray[0]) * 60 * 60);
    // minutes
    seconds = seconds + (parseInt(timeArray[1]) * 60);
    // seconds
    seconds = seconds + parseInt(timeArray[2]);
  } else if (timeArray.length === 2) {
    // minutes
    seconds = seconds + (parseInt(timeArray[0]) * 60);
    // seconds
    seconds = seconds + parseInt(timeArray[1]);
  }
  return seconds;
};

// create unique ids
var uniqueId = function(start) {
  var c = start || 0;
  return function() {
    return c++;
  };
};

// basic key/val store
var store = function() {
  var memo = {};
  return {
    get: function(key) {
      return memo[key];
    },
    set: function(key, val) {
      memo[key] = val;
    }
  };
};

module.exports = {
  unformatTime: unformatTime,
  uniqueId: uniqueId,
  store: store
};
