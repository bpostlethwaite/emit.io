var EventEmitter = require('events').EventEmitter
var Through = require('stream').PassThrough

module.exports = function () {
  var eID = 0

  var self = function () {
    var args = [].slice.call(arguments)
    if (typeof args[0].pipe === 'function') {
      return createEmitter.apply(self, args)
    }
    else return createStream.apply(self, args)
  }

  self.emitters = {}


  function createEmitter (jstream, ev) {
    /*
     * This gets called when we are transforming
     * incoming stream data into emit data. Or
     * adding a new stream to a current emitter.
     */
    if (!ev) ev = new EventEmitter()

    if (!('eID' in ev)) ev.eID = eID++
    if (!(ev.eID in self.emitters)) {
      self.emitters[ev.eID] = {
        streams : []
      , emit : ev.emit
      }
    }

    if (self.emitters[ev.eID].streams.indexOf(jstream) === -1) {
      jstream.on('data', function (data) {
        self.emitters[ev.eID].emit.apply(ev, data);
      });
    }
    return ev
  }

  function createStream (ev, stream) {
    /*
     * Creates an outgoing stream from an
     * emitter. Multiple outgoing streams
     * may be created. A method is added to
     * the emitter to emit down a particular
     * stream
     */
    if (!stream) stream = new Through()
    stream.resume()

    if (!('eID' in ev)) ev.eID = eID++
    if (!(ev.eID in self.emitters)) {
      self.emitters[ev.eID] = {
        streams : []
      , emit : ev.emit
      }
    }

    ev.emit = function () {
      var args = [].slice.call(arguments)
      self.emitters[this.eID].streams.forEach( function (stream) {
        stream.emit('data', args)
      })
      self.emitters[ev.eID].emit.apply(this, args)
    }


    if (!('emitTo' in ev)) ev.emitTo = emitTo

    if (self.emitters[ev.eID].streams.indexOf(stream) === -1) {
      self.emitters[ev.eID].streams.push(stream)
    }

    return stream
  }

  function emitTo () {
    var args = [].slice.call(arguments)
    var stream = args.shift()
    stream.emit('data', args)
  }

  self.createEmitter = createEmitter
  self.createStream = createStream

  return self
}
