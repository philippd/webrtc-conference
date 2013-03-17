'use strict';

angular.module('webrtcConferenceApp')
.controller('RoomCtrl', function ($scope, WebRtcService) {
  var $ = window.$;

  WebRtcService.connect(document.getElementById('you'), '');

  WebRtcService.onRemoteConnect(function (stream, socketId) {
    console.log('Adding remote stream ' + socketId);
    $('#videos').append($('<video id="' + socketId + '" autoplay></video>'));
    window.rtc.attachStream(stream, socketId);
  });

  WebRtcService.onRemoteDisconnect(function (socketId) {
    console.log('Removing remote stream ' + socketId);
    $('#' + socketId).remove();
  });

});