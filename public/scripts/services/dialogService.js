'use strict';

angular.module('webrtcConferenceApp')
  .factory('DialogService', function ($dialog, $location) {

    return {
      createRoomDialog: function () {
        var dialogOpts = {
          backdrop: true,
          keyboard: true,
          backdropClick: true,
          dialogFade: true,
          templateUrl:  '/views/new-room-dialog.html',
          controller: 'NewRoomDialogController'
        };

        var dialog = $dialog.dialog(dialogOpts);
        dialog.open().then(function (roomName) {
          if (roomName) {
            $location.path('room/' + encodeURIComponent(roomName));
          }
        });
      }
    };
  });
