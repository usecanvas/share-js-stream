// jshint -W030

'use strict';

var MockWS        = require('./support/mock-ws');
var ShareJSStream = require('..');
var sinon         = require('sinon');

require('should');

describe('ShareJSStream', function() {
  var ws, stream, errors, messages;

  beforeEach(function() {
    sinon.spy(global, 'setInterval');

    messages = [];
    errors   = [];
    ws       = new MockWS();
    stream   = new ShareJSStream(ws, { keepAlive: false });

    stream.on('data', function onData(data) {
      messages.push(data);
    });

    stream.on('error', function onError(err) {
      errors.push(err);
    });
  });

  afterEach(function() {
    global.setInterval.restore();
  });

  describe('::constructor', function() {
    it('sets the headers from the ws headers', function() {
      stream.headers.should.exactly(ws.upgradeReq.headers);
    });

    it('sets the remoteAddress from the ws connection', function() {
      var addr = ws.upgradeReq.connection.remoteAddress;
      stream.remoteAddress.should.exactly(addr);
    });

    it('is a Duplex stream', function() {
      stream._write.should.be.type('function');
      stream._read.should.be.type('function');
    });

    it('defaults to a 30s keep alive', function() {
      stream = new ShareJSStream(ws);
      global.setInterval.calledOnce.should.be.true;
      global.setInterval.args[0].should.eql([stream.keepAlive, 30 * 1000]);
    });

    it('accepts a keep alive option', function() {
      stream = new ShareJSStream(ws, { keepAlive: 10 * 1000 });
      global.setInterval.calledOnce.should.be.true;
      global.setInterval.args[0].should.eql([stream.keepAlive, 10 * 1000]);
    });

    it('accepts a no keep alive option', function() {
      stream = new ShareJSStream(ws, { keepAlive: false });
      global.setInterval.called.should.be.false;
    });
  });

  describe('keep alive', function() {
    it('sends `null` to the ws', function(done) {
      sinon.spy(ws, 'send');
      stream = new ShareJSStream(ws, { keepAlive: 6 });

      setTimeout(function() {
        ws.send.calledOnce.should.be.true;
        ws.send.args[0].should.eql([null]);
        done();
      }, 10);
    });
  });

  describe('on ws close', function() {
    beforeEach(function() {
      sinon.spy(global, 'clearInterval');
      stream = new ShareJSStream(ws);
    });

    afterEach(function() {
      global.clearInterval.restore();
    });

    it('clears the keepAlive interval', function() {
      ws.emit('close');
      global.clearInterval.calledOnce.should.be.true;
      global.clearInterval.args[0].should.eql([stream.keepAliveInterval]);
    });

    it('closes the stream', function (done) {
      stream.on('close', function() {
        done();
      });

      ws.emit('close');
    });
  });

  describe('when receiving a valid ws message', function() {
    beforeEach(function() {
      ws.emit('message', '{ "foo": "bar" }');
    });

    it('emits the message', function() {
      messages.should.eql([{ foo: 'bar' }]);
    });
  });

  describe('when receiving an invalid ws message (bad JSON)', function() {
    beforeEach(function() {
      sinon.spy(ws, 'close');
      ws.emit('message', 'Not JSON');
    });

    it('does not emit the message', function() {
      messages.should.eql([]);
    });

    it('emits an error', function() {
      errors.length.should.eql(1);
      errors[0].message.should.eql('Client sent invalid JSON');
    });

    it('closes the ws', function() {
      ws.close.calledOnce.should.be.true;
      ws.close.args[0].should.eql([1003, 'Client sent invalid JSON']);
    });
  });

  describe('when the stream ends', function() {
    beforeEach(function() {
      sinon.spy(ws, 'close');
      stream.push(null);
    });

    it('closes the ws normally', function(done) {
      stream.on('end', function() {
        ws.close.calledOnce.should.be.true;
        ws.close.args[0].should.eql([1000]);
        done();
      });
    });
  });

  describe('when there is a stream error', function() {
    beforeEach(function() {
      sinon.spy(ws, 'close');
      stream.emit('error', new Error('Error message'));
    });

    it('closes the ws', function() {
      ws.close.calledOnce.should.be.true;
      ws.close.args[0].should.eql([1008, 'Error message']);
    });
  });
});
