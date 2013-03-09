'use strict';

describe('Controller: RoomCtrl', function () {

  // load the controller's module
  beforeEach(module('webrtcConferenceApp'));

  var RoomCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
    scope = {};
    RoomCtrl = $controller('RoomCtrl', {
      $scope: scope
    });
  }));
  
});
