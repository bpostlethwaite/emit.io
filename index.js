var EventEmitter = require('events').EventEmitter
var through = require('through')

module.exports = function () {
  var eID = 0

  var self = function () {
    var args = [].slice.call(arguments)
    if (typeof args[0].pipe === 'function') {
      return createEmitter.apply(self, args)
    }
    else return createStream.apply(self, args)
  }

  self.emitterMap = {}


  function createEmitter (jstream, ev) {

    if (!ev) ev = new EventEmitter

    if (!('eID' in ev)) ev.eID = eID++
    if (!(ev.eID in self.emitterMap)) self.emitterMap[ev.eID] = []

    var emit = ev.emit
    jstream.on('data', function (data) {
      emit.apply(ev, data);
    });

    return ev
  }

  function createStream (ev, stream) {
    if (!stream) stream = through()
    var emit = ev.emit

    if (!('eID' in ev)) ev.eID = eID++
    if (!(ev.eID in self.emitterMap)) self.emitterMap[ev.eID] = []

    ev.emit = function () {
      var args = [].slice.call(arguments)
      self.emitterMap[ev.eID].forEach( function (stream) {
        stream.emit('data', args)
      })
      emit.apply(ev, args)
    }

    self.emitterMap[ev.eID].push(stream)
    return stream
  }


  self.createEmitter = createEmitter
  self.createStream = createStream

  return self
}
