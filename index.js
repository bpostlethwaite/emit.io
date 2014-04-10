var EventEmitter = require('events').EventEmitter
var through = require('through')

module.exports = function () {

  var self = {}
  self.pushStreams = []


  function createEmitter (jstream) {
    var ev = new EventEmitter;
    var emit = ev.emit

    jstream.on('data', function (data) {
      emit.apply(ev, data);
    });

    ev.emit = function () {
      var args = [].slice.call(arguments)
      self.pushStreams.forEach( function (stream) {
        stream.emit('data', args)
      })
      emit.apply(ev, args)
    }

    return ev
  }

  function createStream () {
    var pushstream = through()
    self.pushStreams.push(pushstream)
    return pushstream
  }


  self.createEmitter = createEmitter
  self.createStream = createStream

  return self
}
