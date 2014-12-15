module.exports = function (string) {
  var timeArray = string.split(':'),
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
