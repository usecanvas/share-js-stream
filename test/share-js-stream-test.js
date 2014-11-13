// jshint -W030

'use strict';

var MockWS        = require('./support/mock-ws');
var ShareJSStream = require('..');
var sinon         = require('sinon');

require('should');

describe('ShareJSStream', function() {
  var ws, stream;

  beforeEach(function() {
    sinon.spy(global, 'setInterval');
    ws     = new MockWS();
    stream = new ShareJSStream(ws);
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
      global.setInterval.calledOnce.should.be.true;
      global.setInterval.args[0].should.eql([stream.keepAlive, 30 * 1000]);
    });

    it('accepts a keep alive option', function() {
      stream = new ShareJSStream(ws, { keepAlive: 10 * 1000 });
      global.setInterval.args[1].should.eql([stream.keepAlive, 10 * 1000]);
    });

    it('accepts a no keep alive option', function() {
      stream = new ShareJSStream(ws, { keepAlive: false });
      global.setInterval.calledOnce.should.be.true;
    });
  });
});
