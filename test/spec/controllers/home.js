'use strict';

describe('Controller: HomeCtrl', function () {

  // load the controller's module
  beforeEach(module('webrtcConferenceApp'));

  // Initialize the httpBackend mock
  beforeEach(inject(function ($httpBackend) {
    $httpBackend.when('GET', '/api/rooms').respond([
      {name: 'Room Bla Bla 1'},
      {name: 'My Second Room'},
      {name: 'Testing web rtc!'}
    ]);
  }));

  afterEach(inject(function ($httpBackend) {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  }));

  it('should fetch 3 rooms', inject(function ($controller, $rootScope, $httpBackend) {
    $httpBackend.expectGET('/api/rooms');

    var controllerScope = $rootScope.$new();
    var HomeCtrl = $controller('HomeCtrl', {
      $scope: controllerScope
    });

    expect(controllerScope.rooms.length).toBe(0);
    $httpBackend.flush();
    expect(controllerScope.rooms.length).toBe(3);
  }));
});
