'use strict';

describe('Controller: HomeCtrl', function () {

  // load the controller's module
  beforeEach(module('webrtcConferenceApp'));

  var HomeCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller) {
    scope = {};
    HomeCtrl = $controller('HomeCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of rooms to the scope', function () {
    expect(scope.rooms.length).toBe(3);
  });
});
