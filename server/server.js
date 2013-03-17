'use strict';

// Modules

var express = require('express');
var api = require('./api');
var app = module.exports = express();
var server = require('http').createServer(app);
var webRTC = require('webrtc.io').listen(server);

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/../dist'));
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// JSON API

app.get('/api/rooms', api.rooms);

// redirect all others to the index (HTML5 history)
app.get('*', function (req, res) {
  res.redirect('index.html');
});

// WebRTC

webRTC.rtc.on('connect', function(rtc) {
  console.log('Client connected!');
});

// Start server

var port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log('Express server listening on port %d in %s mode', this.address().port, app.settings.env);
});