'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits     = require('util').inherits;

function MockWS() {
  this.upgradeReq = {
    headers: { foo: 'bar' },
    connection: { remoteAddress: '1.1.1.1' }
  };

  EventEmitter.call(this);
}

inherits(MockWS, EventEmitter);

module.exports = MockWS;
