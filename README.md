# ShareJSStream [![Build Status](https://travis-ci.org/slowink/share-js-stream.svg?branch=master)](https://travis-ci.org/slowink/share-js-stream)

ShareJSStream is a stream that can be used to manage communication between a
[ShareJS client][sharejs-client] and a [ws connection][ws-conn].

It is a basic drop-in implementation of the ShareJS example stream.

## Installation

```sh
npm install share-js-stream
```

## Usage

When a connection is established on a ws server, create a ShareJS server client
and tell it to listen on a ShareJSStream:

```javascript
var ShareJSStream = require('share-js-stream');
var WsServer      = require('ws').Server;
var http          = require('http');
var livedb        = require('livedb');
var shareServer   = require('share').server.createClient({
  backend: livedb.client(livedb.memory()) 
});

http.createServer().listen(process.env.PORT, function onListen() {
  var wsServer = new WsServer({ server: this });
  wsServer.on('connection', onConnection);
});

function onConnection(conn) {
  var stream = new ShareJSStream(conn);
  shareServer.listen(stream);
}
```

## Testing

Run tests:

```sh
npm test
```

There is also a sandbox that can be started:

```sh
node test/sandbox
```

This will serve a basic ShareJS app (with an in-memory store) on
`process.env.PORT` or port 5000. Debugging on the ShareJSStream is enabled here,
so you'll see verbose logging for stream activity in the console.

[sharejs-client]: https://github.com/share/ShareJS
[ws-conn]: https://github.com/einaros/ws/blob/master/doc/ws.md#class-wswebsocket
