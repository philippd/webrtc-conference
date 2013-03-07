'use strict';

angular.module('webrtcConferenceApp', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/room', {
        templateUrl: 'views/room.html'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
