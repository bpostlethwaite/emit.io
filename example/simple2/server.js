/*
 * Utilize existing EventEmitter
 */

var websocket = require('websocket-stream')
  , WebSocketServer = require('ws').Server
  , JSONStream = require('JSONStream')
  , emitIO = require('../../.')()
  , server =  new WebSocketServer({port: 8080})
  , EventEmitter = require('events').EventEmitter


server.on('connection', function(ws) {


  var wstream = websocket(ws)
    , parser = wstream.pipe(JSONStream.parse([true]))
    , ev = new EventEmitter()

  ev.on('local', function (msg) {console.log(msg)})
  ev.emit('local', 'existing server emitter')

  // link incoming stream to existing emitter
  emitIO(parser, ev)
  // link emitter to outgoing stream
  var emitStream = emitIO(ev)


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
