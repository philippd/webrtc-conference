'use strict';

angular.module('webrtcConferenceApp')
  .directive('navigation', function (DialogService) {
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
  });
