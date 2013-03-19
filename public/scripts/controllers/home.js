'use strict';

angular.module('webrtcConferenceApp')
  .controller('HomeCtrl', function ($scope, $http, DialogService) {

    $scope.rooms = [];
    $http.get('/api/rooms').success(function (data) {
      $scope.rooms = data;
    });

    $scope.createRoom = function () {
      DialogService.createRoomDialog();
    };
  });
