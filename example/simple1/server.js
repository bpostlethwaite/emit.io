var websocket = require('websocket-stream')
  , WebSocketServer = require('ws').Server
  , JSONStream = require('JSONStream')
  , emitIO = require('../../.')()
  , server =  new WebSocketServer({port: 8080})

server.on('connection', function(ws) {


  var wstream = websocket(ws)
    , parser = wstream.pipe(JSONStream.parse([true]))
    // create emitter from incoming stream
    , ev = emitIO(parser)
    // create outgoing stream from emitter
    , emitStream = emitIO(ev)

  // send local messages over websocket
  emitStream
  .pipe(JSONStream.stringify())
  .pipe(wstream)

  ////////////////////////////////////////////////
  ev.emit('server ok', Date.now())

  ev.on('client message', function (msg) {
    console.log(msg)
  })

  wstream.on('close', function() {
    console.log('disconnected')
  })

})
