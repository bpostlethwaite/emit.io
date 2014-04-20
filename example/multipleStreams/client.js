var JSONStream = require('JSONStream')
  , websocket = require('websocket-stream')
  , wstream = websocket('ws://localhost:8080')
  , parser = JSONStream.parse([true])
  , stringify = JSONStream.stringify()
  , emitIO = require('../../.')()
// create emitter from incoming stream
  , ev = emitIO(parser)
// create outgoing stream from emitter
  , emitStream = emitIO(ev)

wstream.pipe(parser)

emitStream.pipe(stringify).pipe(wstream)

ev.on('server ok', function (t) {
    console.log('server ok: ' + t)
})

ev.emit('client message' ,'this is a message from the client')
