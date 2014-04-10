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
  emitStream.pipe(s1)
  emitStream.pipe(s2)
  ev.emit('client-msg', 'hello from the client!')

  ev.on('server-msg', function (msg) {
    console.log('client got:', msg)
  })

})
