var JSONStream = require('JSONStream');
var websocket = require('websocket-stream');
var wstream = websocket('ws://localhost:8080');
var parser = JSONStream.parse([true])
var stringify = JSONStream.stringify()
var emitIO = require('./')()

var ev = emitIO.createEmitter(parser)
var ev2 = emitIO.createEmitter(parser)

var emitStream = emitIO.createStream()

wstream.pipe(parser)

emitStream.pipe(stringify).pipe(wstream)
//////////////////////////////////////////////////

// emitter 1 connected to same pipeline
ev.on('server ok', function (t) {
    console.log('server ok: ' + t);
});

// emitter 2 connected to same pipeline
ev2.on('server ok', function (t) {
    console.log('server2 ok: ' + t);
});

// emitter 1 add listener for local message
ev.on('banjo', function (instrument) {
    console.log('yocals play', instrument)
})

// emitter 1 emit local message
ev.emit('banjo', 'banjo')

// emit a msg with no local listener, only "remote" listener
ev.emit('client message' ,'this is a message from the client');
