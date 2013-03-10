'use strict';

angular.module('webrtcConferenceApp')
  .controller('HomeCtrl', function ($scope, $http) {
    $scope.rooms = [];
    $http.get('/api/rooms').success(function (data) {
      $scope.rooms = data;
    });
  });
