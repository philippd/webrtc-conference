var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection;
var URL = window.URL || window.webkitURL || window.msURL || window.oURL;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
(function () {
  var rtc;
  if ('undefined' === typeof module) {
    rtc = this.rtc = {};
  } else {
    rtc = module.exports = {};
  }
  rtc._socket = null;
  rtc._me = null;
  rtc._events = {};
  rtc.on = function (eventName, callback) {
    rtc._events[eventName] = rtc._events[eventName] || [];
    rtc._events[eventName].push(callback);
  };
  rtc.fire = function (eventName, _) {
    var events = rtc._events[eventName];
    var args = Array.prototype.slice.call(arguments, 1);
    if (!events) {
      return;
    }
    for (var i = 0, len = events.length; i < len; i++) {
      events[i].apply(null, args);
    }
  };
  rtc.SERVER = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };
  rtc.peerConnections = {};
  rtc.connections = [];
  rtc.streams = [];
  rtc.numStreams = 0;
  rtc.initializedStreams = 0;
  rtc.dataChannels = {};
  rtc.dataChannelConfig = { optional: [{ RtpDataChannels: true }] };
  rtc.checkDataChannelSupport = function () {
    try {
      var pc = new PeerConnection(rtc.SERVER, rtc.dataChannelConfig);
      channel = pc.createDataChannel('supportCheck', { reliable: false });
      channel.close();
      return true;
    } catch (e) {
      return false;
    }
  };
  rtc.dataChannelSupport = rtc.checkDataChannelSupport();
  rtc.connect = function (server, room) {
    room = room || '';
    rtc._socket = new WebSocket(server);
    rtc._socket.onopen = function () {
      rtc._socket.send(JSON.stringify({
        'eventName': 'join_room',
        'data': { 'room': room }
      }));
      rtc._socket.onmessage = function (msg) {
        var json = JSON.parse(msg.data);
        rtc.fire(json.eventName, json.data);
      };
      rtc._socket.onerror = function (err) {
        console.error('onerror');
        console.error(err);
      };
      rtc._socket.onclose = function (data) {
        rtc.fire('disconnect stream', rtc._socket.id);
        delete rtc.peerConnections[rtc._socket.id];
      };
      rtc.on('get_peers', function (data) {
        rtc.connections = data.connections;
        rtc._me = data.you;
        rtc.fire('connections', rtc.connections);
      });
      rtc.on('receive_ice_candidate', function (data) {
        var candidate = new RTCIceCandidate(data);
        rtc.peerConnections[data.socketId].addIceCandidate(candidate);
        rtc.fire('receive ice candidate', candidate);
      });
      rtc.on('new_peer_connected', function (data) {
        rtc.connections.push(data.socketId);
        var pc = rtc.createPeerConnection(data.socketId);
        for (var i = 0; i < rtc.streams.length; i++) {
          var stream = rtc.streams[i];
          pc.addStream(stream);
        }
      });
      rtc.on('remove_peer_connected', function (data) {
        rtc.fire('disconnect stream', data.socketId);
        delete rtc.peerConnections[data.socketId];
      });
      rtc.on('receive_offer', function (data) {
        rtc.receiveOffer(data.socketId, data.sdp);
        rtc.fire('receive offer', data);
      });
      rtc.on('receive_answer', function (data) {
        rtc.receiveAnswer(data.socketId, data.sdp);
        rtc.fire('receive answer', data);
      });
      rtc.fire('connect');
    };
  };
  rtc.sendOffers = function () {
    for (var i = 0, len = rtc.connections.length; i < len; i++) {
      var socketId = rtc.connections[i];
      rtc.sendOffer(socketId);
    }
  };
  rtc.onClose = function (data) {
    rtc.on('close_stream', function () {
      rtc.fire('close_stream', data);
    });
  };
  rtc.createPeerConnections = function () {
    for (var i = 0; i < rtc.connections.length; i++) {
      rtc.createPeerConnection(rtc.connections[i]);
    }
  };
  rtc.createPeerConnection = function (id) {
    var config;
    if (rtc.dataChannelSupport)
      config = rtc.dataChannelConfig;
    var pc = rtc.peerConnections[id] = new PeerConnection(rtc.SERVER, config);
    pc.onicecandidate = function (event) {
      if (event.candidate) {
        rtc._socket.send(JSON.stringify({
          'eventName': 'send_ice_candidate',
          'data': {
            'label': event.candidate.label,
            'candidate': event.candidate.candidate,
            'socketId': id
          }
        }));
      }
      rtc.fire('ice candidate', event.candidate);
    };
    pc.onopen = function () {
      rtc.fire('peer connection opened');
    };
    pc.onaddstream = function (event) {
      rtc.fire('add remote stream', event.stream, id);
    };
    if (rtc.dataChannelSupport) {
      pc.ondatachannel = function (evt) {
        console.log('data channel connecting ' + id);
        rtc.addDataChannel(id, evt.channel);
      };
    }
    return pc;
  };
  rtc.sendOffer = function (socketId) {
    var pc = rtc.peerConnections[socketId];
    pc.createOffer(function (session_description) {
      pc.setLocalDescription(session_description);
      rtc._socket.send(JSON.stringify({
        'eventName': 'send_offer',
        'data': {
          'socketId': socketId,
          'sdp': session_description
        }
      }));
    });
  };
  rtc.receiveOffer = function (socketId, sdp) {
    var pc = rtc.peerConnections[socketId];
    pc.setRemoteDescription(new RTCSessionDescription(sdp));
    rtc.sendAnswer(socketId);
  };
  rtc.sendAnswer = function (socketId) {
    var pc = rtc.peerConnections[socketId];
    pc.createAnswer(function (session_description) {
      pc.setLocalDescription(session_description);
      rtc._socket.send(JSON.stringify({
        'eventName': 'send_answer',
        'data': {
          'socketId': socketId,
          'sdp': session_description
        }
      }));
      var offer = pc.remoteDescription;
    });
  };
  rtc.receiveAnswer = function (socketId, sdp) {
    var pc = rtc.peerConnections[socketId];
    pc.setRemoteDescription(new RTCSessionDescription(sdp));
  };
  rtc.createStream = function (opt, onSuccess, onFail) {
    var options;
    onSuccess = onSuccess || function () {
    };
    onFail = onFail || function () {
    };
    options = {
      video: !!opt.video,
      audio: !!opt.audio
    };
    if (getUserMedia) {
      rtc.numStreams++;
      getUserMedia.call(navigator, options, function (stream) {
        rtc.streams.push(stream);
        rtc.initializedStreams++;
        onSuccess(stream);
        if (rtc.initializedStreams === rtc.numStreams) {
          rtc.fire('ready');
        }
      }, function () {
        alert('Could not connect stream.');
        onFail();
      });
    } else {
      alert('webRTC is not yet supported in this browser.');
    }
  };
  rtc.addStreams = function () {
    for (var i = 0; i < rtc.streams.length; i++) {
      var stream = rtc.streams[i];
      for (var connection in rtc.peerConnections) {
        rtc.peerConnections[connection].addStream(stream);
      }
    }
  };
  rtc.attachStream = function (stream, domId) {
    document.getElementById(domId).src = URL.createObjectURL(stream);
  };
  rtc.createDataChannel = function (pcOrId, label) {
    if (!rtc.dataChannelSupport) {
      alert('webRTC data channel is not yet supported in this browser,' + ' or you must turn on experimental flags');
      return;
    }
    if (typeof pcOrId === 'string') {
      id = pcOrId;
      pc = rtc.peerConnections[pcOrId];
    } else {
      pc = pcOrId;
      id = undefined;
      for (var key in rtc.peerConnections) {
        if (rtc.peerConnections[key] === pc)
          id = key;
      }
    }
    if (!id)
      throw new Error('attempt to createDataChannel with unknown id');
    if (!pc || !(pc instanceof PeerConnection))
      throw new Error('attempt to createDataChannel without peerConnection');
    label = label || 'fileTransfer' || String(id);
    options = { reliable: false };
    try {
      console.log('createDataChannel ' + id);
      channel = pc.createDataChannel(label, options);
    } catch (error) {
      console.log('seems that DataChannel is NOT actually supported!');
      throw error;
    }
    return rtc.addDataChannel(id, channel);
  };
  rtc.addDataChannel = function (id, channel) {
    channel.onopen = function () {
      console.log('data stream open ' + id);
      rtc.fire('data stream open', channel);
    };
    channel.onclose = function (event) {
      delete rtc.dataChannels[id];
      console.log('data stream close ' + id);
      rtc.fire('data stream close', channel);
    };
    channel.onmessage = function (message) {
      console.log('data stream message ' + id);
      console.log(message);
      rtc.fire('data stream data', channel, message.data);
    };
    channel.onerror = function (err) {
      console.log('data stream error ' + id + ': ' + err);
      rtc.fire('data stream error', channel, err);
    };
    rtc.dataChannels[id] = channel;
    return channel;
  };
  rtc.addDataChannels = function () {
    if (!rtc.dataChannelSupport)
      return;
    for (var connection in rtc.peerConnections)
      rtc.createDataChannel(connection);
  };
  rtc.on('ready', function () {
    rtc.createPeerConnections();
    rtc.addStreams();
    rtc.addDataChannels();
    rtc.sendOffers();
  });
}.call(this));
'use strict';
angular.module('webrtcConferenceApp', ['ui.bootstrap']).config(function ($routeProvider, $locationProvider) {
  $routeProvider.when('/', {
    templateUrl: '/views/home.html',
    controller: 'HomeCtrl'
  }).when('/room/:roomId', {
    templateUrl: '/views/room.html',
    controller: 'RoomCtrl'
  }).otherwise({ redirectTo: '/' });
  $locationProvider.html5Mode(true);
});
'use strict';
angular.module('webrtcConferenceApp').controller('HomeCtrl', [
  '$scope',
  '$http',
  'DialogService',
  function ($scope, $http, DialogService) {
    $scope.rooms = [];
    $http.get('/api/rooms').success(function (data) {
      $scope.rooms = data;
    });
    $scope.createRoom = function () {
      DialogService.createRoomDialog();
    };
  }
]);
'use strict';
angular.module('webrtcConferenceApp').controller('NewRoomDialogController', [
  '$scope',
  'dialog',
  function ($scope, dialog) {
    $scope.createRoom = function (roomName) {
      dialog.close(roomName);
    };
  }
]);
'use strict';
angular.module('webrtcConferenceApp').controller('RoomCtrl', [
  '$scope',
  '$routeParams',
  'WebRtcService',
  function ($scope, $routeParams, WebRtcService) {
    console.log('initializing with route params: ' + $routeParams.roomId);
    var $ = window.$;
    WebRtcService.connect(document.getElementById('you'), decodeURIComponent($routeParams.roomId));
    WebRtcService.onRemoteConnect(function (stream, socketId) {
      console.log('Adding remote stream ' + socketId);
      $('#videos').append($('<video id="' + socketId + '" autoplay></video>'));
      window.rtc.attachStream(stream, socketId);
    });
    WebRtcService.onRemoteDisconnect(function (socketId) {
      console.log('Removing remote stream ' + socketId);
      $('#' + socketId).remove();
    });
  }
]);
'use strict';
angular.module('webrtcConferenceApp').directive('navigation', [
  'DialogService',
  function (DialogService) {
    return {
      templateUrl: 'views/directives/navigation.html',
      restrict: 'EA',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.createRoom = function () {
          DialogService.createRoomDialog();
        };
      }
    };
  }
]);
'use strict';
angular.module('webrtcConferenceApp').factory('WebRtcService', [function () {
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
  }]);
'use strict';
angular.module('webrtcConferenceApp').factory('DialogService', [
  '$dialog',
  '$location',
  function ($dialog, $location) {
    return {
      createRoomDialog: function () {
        var dialogOpts = {
            backdrop: true,
            keyboard: true,
            backdropClick: true,
            dialogFade: true,
            templateUrl: '/views/new-room-dialog.html',
            controller: 'NewRoomDialogController'
          };
        var dialog = $dialog.dialog(dialogOpts);
        dialog.open().then(function (roomName) {
          if (roomName) {
            $location.path('room/' + encodeURIComponent(roomName));
          }
        });
      }
    };
  }
]);