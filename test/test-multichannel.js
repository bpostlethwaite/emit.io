var tap = require('tap')
var MuxDemux = require('mux-demux')
var net = require('net')
var EmitFactory = require('../.')

tap.test('multi channel emitters', function (t) {

  t.plan(4)

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

    var s1 = mx.createStream()
    var s2 = mx.createStream()
    var ev = emitIO(s1)
    var emitStream = emitIO(ev)
    emitIO(s2, ev)
    emitStream.pipe(s1)
    emitStream.pipe(s2)

    ev.emit('client-msg', 'a-ok')

    var expecting = 2
    ev.on('server-msg', function (msg) {
      t.equal(msg, 'b-ok', 'client received server msg')
      expecting--
      if (expecting === 0) mx.destroy()
    })

  })

  t.on('end', function () {
    server.close()
  })
})
