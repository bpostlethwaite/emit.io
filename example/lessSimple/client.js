var JSONStream = require('JSONStream');
var websocket = require('websocket-stream');
var wstream = websocket('ws://localhost:8080');
var parser = JSONStream.parse([true])
var emitIO = require('../../.')()
var EventEmitter = require('events').EventEmitter

// a local event Emitter
var ev = new EventEmitter()

// create outgoing stream from local emitter
var emitStream = emitIO(ev)

// link incoming stream to ev
emitIO(parser, ev)

// build another emitter from an existing incoming stream
// and link it to an existing outgoing stream
var ev2 = emitIO(parser)
emitIO(ev2, emitStream)


wstream.pipe(parser)

emitStream
.pipe(JSONStream.stringify())
.pipe(wstream)

//////////////////////////////////////////////////

// emit a msg from an existing local event emitter
ev.emit('client message' ,'this is a message from an existing emitter');

// emit a msg from emitIO emitter
ev2.emit('client message' ,'this is a message from emitIO');

// emitter 1 connected to same pipeline
ev.on('server-message', function (msg) {
    console.log("client emitter 1 says", msg);
});

// emitter 2 connected to same pipeline
ev2.on('server-message', function (msg) {
    console.log("client emitter 2 says", msg);
});


// emitter 1 add listener for local message
ev.on('banjo', function (instrument) {
    console.log('yocals play', instrument)
})

// emitter 1 emit local message
ev.emit('banjo', 'banjo')
