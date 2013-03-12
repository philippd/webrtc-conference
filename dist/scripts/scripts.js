'use strict';
angular.module('webrtcConferenceApp', []).config(function ($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl'
  }).when('/room', {
    templateUrl: 'views/room.html',
    controller: 'RoomCtrl'
  }).otherwise({ redirectTo: '/' });
});
'use strict';
angular.module('webrtcConferenceApp').controller('HomeCtrl', [
  '$scope',
  '$http',
  function ($scope, $http) {
    $scope.rooms = [];
    $http.get('/api/rooms').success(function (data) {
      $scope.rooms = data;
    });
  }
]);
'use strict';
angular.module('webrtcConferenceApp').controller('RoomCtrl', [
  '$scope',
  function ($scope) {
  }
]);
'use strict';
angular.module('webrtcConferenceApp').directive('navigation', [function () {
    return {
      templateUrl: 'views/directives/navigation.html',
      restrict: 'EA',
      replace: true,
      link: function postLink(scope, element, attrs) {
      }
    };
  }]);