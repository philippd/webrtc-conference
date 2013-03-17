'use strict';

angular.module('webrtcConferenceApp')
.factory('WebRtcService', function () {
  var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection;
  var rtc = window.rtc;
  var URL = window.URL;
  var onRemoteConnect;
  var onRemoteDisconnect;

  rtc.on('add remote stream', function (stream, socketId) {
    if (onRemoteConnect) {
      onRemoteConnect(stream, socketId);
    } else {
      console.log('No onRemoteConnect function registered.');
    }
  });

  rtc.on('disconnect stream', function (socketId) {
    if (onRemoteDisconnect) {
      onRemoteDisconnect(socketId);
    } else {
      console.log('No onRemoteDisconnect function registered.');
    }
  });

  return {
    connect: function (videoElement, roomId) {
      rtc.createStream({
        'video': true,
        'audio': true
      }, function (stream) {
        videoElement.src = URL.createObjectURL(stream);
      });
      rtc.connect('ws:' + window.location.href.substring(window.location.protocol.length).split('#')[0], roomId);
    },
    onRemoteConnect: function (callback) {
      onRemoteConnect = callback;
    },
    onRemoteDisconnect: function (callback) {
      onRemoteDisconnect = callback;
    }
  };
});
