var tap = require('tap')
var MuxDemux = require('mux-demux')
var net = require('net')
var EmitFactory = require('../.')

tap.test('stream -> emitter -> stream', function (t) {

  t.plan(2)

  var server = net.createServer(onConn).listen(9999)

  function onConn (con) {
    var emitIO = EmitFactory()
    var mx = MuxDemux(onMux)
    con.pipe(mx).pipe(con)

    function onMux(stream) {
      var ev = emitIO(stream)
      var emitStream = emitIO(ev)
      emitStream.pipe(stream)

      ev.on('client-msg', function (msg) {
        t.equal(msg, 'a-ok', 'server received client msg')
      })
      ev.emit('server-msg', 'b-ok')
    }
  }

  server.on('listening', function () {
    var emitIO = EmitFactory()
    var con = net.connect(9999)
    var mx = MuxDemux()

    con.pipe(mx).pipe(con)

    con.on('end', function () {
      console.error('mx client ending')
    })

    var s = mx.createStream()
    var ev = emitIO(s)

    var emitStream = emitIO(ev)
    emitStream.pipe(s)

    ev.emit('client-msg', 'a-ok')

    ev.on('server-msg', function (msg) {
      t.equal(msg, 'b-ok', 'client received server msg')
        mx.destroy()
    })

  })

  t.on('end', function () {
    server.close()
  })
})
