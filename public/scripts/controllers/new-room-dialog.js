'use strict';

angular.module('webrtcConferenceApp')
  .controller('NewRoomDialogController', function ($scope, dialog) {
    $scope.createRoom = function (roomName) {
      dialog.close(roomName);
    };
  });