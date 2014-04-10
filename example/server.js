var websocket = require('websocket-stream');
var WebSocketServer = require('ws').Server;
var JSONStream = require('JSONStream');
var emitIO = require('./')()

var server =  new WebSocketServer({port: 8080});

server.on('connection', function(ws) {


  var wstream = websocket(ws);
  var parser = JSONStream.parse([true])
  var emitStream = emitIO.createStream()
  var ev = emitIO.createEmitter(wstream.pipe(parser))

  // pipeline 1 --- will send local messages over websocket
  emitStream
  .pipe(JSONStream.stringify())
  .pipe(wstream);

  // new pipeline 2 --- will print local messages as array
  emitIO.createStream()
  .pipe(JSONStream.stringify())
  .pipe(process.stdout)

////////////////////////////////////////////////
  ev.emit('server ok', Date.now());

  ev.on('client message', function (msg) {
    console.log(msg);
  });

  wstream.on('close', function() {
    console.log('disconnected');
  });

});
