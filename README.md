emit.io
=======

Turn a node stream into a socket.io-like 2-way messaging channel. Turn an event emitter into a stream. Multiple stream destinations and multiple listeners are supported.


## example - 2 way messaging
```javascript
var emitIO = require('emit.io')
var emitter = emitIO(inputStream)
var outputStream = emitIO(emitter)
socket.pipe(inputStream)
outputStream.pipe(socket)
emitter.on('remote-msg', function () {})
emitter.emit('send-to-remote', {data: 3})
```

## Usage `var emitIO = require('emit.io')`
In the following section references to `socket` are assumed to be a duplex socket like a tcp connection or websocket connection or any other node duplex stream. You will have to add some sort of JSON encoding logic, that is left out for brevity. ([JSONStream](https://github.com/dominictarr/JSONStream) or [mux-demux](https://github.com/dominictarr/mux-demux) are recommended)

### Stream->Emitter
Just pass `emitIO` a stream and it will return an event emitter that will listen on the stream for events
```javascript
var emitter = emitIO(inStream)
```

### Emitter->Stream
Pass `emitIO` an emitter and receive a stream that will channel the events. For 2-way communication, pass in the emitter that was returned by the stream->emitter call.

**New Emitter**
```javascript
var ev = emitIO(inStream)
var outStream = emitIO(ev)
socket.pipe(inStream)
outStream.pipe(socket)
```

### Link existing emitter into an inputStream
To hook an existing event emitter into an input and output channel do:
```javascript
var ev = new EventEmitter()
var outStream = emitIO(ev)
emitIO(inStream, ev)
socket.pipe(inStream)
outStream.pipe(socket)
```

### Hook new emitters into existing outgoing streams
You can get a new emitter from an incoming stream and hook it into an existing outgoing stream
```javascript
var outStream = emitIO(someExistingEmitter)
var newEmitter = emitIO(inStream)
emitIO(newEmitter, outStream)   // now newEmitter will pipe its communication down the same channel as someExistingEmitter
```
### Send events down multiple streams
To send events from a single emitter down multiple streams do
```javascript
var MuxDemux = require('mux-demux')
var net = require('net')
var EmitFactory = require('../../.')

net.createServer(function (con) {
  var emitIO = EmitFactory()
  var mx = MuxDemux(function (stream) {
             var ev = emitIO(stream)
             var emitStream = emitIO(ev)
             emitStream.pipe(stream)

             ev.on('client-msg', function (msg) {
               console.log('server emitter', ev.eID, 'got msg', msg)
             })
             ev.emit('server-msg', 'server msg from emitter ' + ev.eID)
           })
  con.pipe(mx).pipe(con)

}).listen(8642, function () {
  var emitIO = EmitFactory()
  var con = net.connect(8642)
    , mx = MuxDemux()
  con.pipe(mx).pipe(con)
  // you can easily create a new emitter and stream for each
  // mx stream, but we are going to have more fun and wire
  // both streams into one emitter, and let that one emitter
  // send events down both streams
  var s1 = mx.createStream()
  var s2 = mx.createStream()
  var ev = emitIO(s1)
  emitIO(s2, ev) // hook s2 into our emitter
  var emitStream = emitIO(ev) // get an output stream
  emitStream.pipe(s1) // pipe output to s1
  emitStream.pipe(s2) // pipe output to s2

  ev.emit('client-msg', 'hello from the client!')

  ev.on('server-msg', function (msg) {
    console.log('client got:', msg)
  })

})
```
which prints
```bash
server emitter 0 got msg hello from the client!
server emitter 1 got msg hello from the client!
client got: server msg from emitter0
client got: server msg from emitter1
```
