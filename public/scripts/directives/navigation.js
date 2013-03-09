'use strict';

angular.module('webrtcConferenceApp')
  .directive('navigation', function () {
    return {
      templateUrl: 'views/directives/navigation.html',
      restrict: 'EA',
      replace: true,
      link: function postLink(scope, element, attrs) {
      }
    };
  });
