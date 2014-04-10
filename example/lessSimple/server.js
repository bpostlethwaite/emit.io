var websocket = require('websocket-stream');
var WebSocketServer = require('ws').Server;
var JSONStream = require('JSONStream');
var emitIO = require('../../.')()

var server =  new WebSocketServer({port: 8080});

server.on('connection', function(ws) {


  var wstream = websocket(ws);
  var parser = wstream.pipe(JSONStream.parse([true]))
  var ev1 = emitIO(parser)
  var ev2 = emitIO(parser)

  var emitStream = emitIO(ev1)

  // pipeline 1 --- will send and receive local messages over websocket
  emitStream
  .pipe(JSONStream.stringify())
  .pipe(wstream);


////////////////////////////////////////////////
  ev1.emit('server-message', 'server emitter 1 ok');
  ev2.emit('server emitter 2 ok', 'server emitter 2 ok');

  ev1.on('client message', function (msg) {
    console.log(msg);
  });

  wstream.on('close', function() {
    console.log('disconnected');
  });

});
