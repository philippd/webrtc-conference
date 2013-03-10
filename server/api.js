'use strict';

exports.rooms = function (req, res) {
  console.log('returning some fake rooms...');
  res.json([
      {name: 'Room Bla Bla 1'},
      {name: 'My Second Room'},
      {name: 'Testing web rtc!'}
    ]);
};