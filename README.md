# ShareJSStream

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
var http          = require('http');
var livedb        = require('livedb');
var share         = require('share');
var ShareJSStream = require('share-js-stream');
var WsServer      = require('ws').Server;

http.createServer().listen(process.env.PORT, function onListen() {
  var wsServer = new WsServer({ server: this });
  wsServer.on('connection', onConnection);
});

function onConnection(conn) {
  var stream = new ShareJSStream(conn);
  share.server
    .createClient({ backend: livedb.client(livedb.memory()) })
    .listen(stream);
}
```

[sharejs-client]: https://github.com/share/ShareJS
[ws-conn]: https://github.com/einaros/ws/blob/master/doc/ws.md#class-wswebsocket
