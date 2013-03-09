'use strict';

angular.module('webrtcConferenceApp')
  .controller('HomeCtrl', function ($scope) {
    $scope.rooms = [
      {name: 'Room Bla Bla 1'},
      {name: 'My Second Room'},
      {name: 'Testing web rtc!'}
    ];
  });
