'use strict';

var webRTC;

exports.init = function (rtc) {
  webRTC = rtc;
};

exports.rooms = function (req, res) {
  console.log('Returning rooms...');

  var rooms = [];
  for (var key in webRTC.rtc.rooms) {
    rooms.push({name: key});
  }
  res.json(rooms);
};