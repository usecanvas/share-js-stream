var express       = require('express');
var http          = require('http');
var livedb        = require('livedb');
var path          = require('path');
var share         = require('share');
var ShareJSStream = require('../..');
var WsServer      = require('ws').Server;
var port          = process.env.PORT || 5000;
var app           = express();

var shareServer = share.server.createClient({
  backend: livedb.client(livedb.memory())
});

app.use(express.static(share.scriptsDir));
app.use(express.static(path.join(__dirname, './public')));

http.createServer(app).listen(port, function onListen() {
  console.log('listening on port', port);
  var wsServer = new WsServer({ server: this });
  wsServer.on('connection', onConnection);
});

function onConnection(conn) {
  var stream = new ShareJSStream(conn, { debug: true });
  shareServer.listen(stream);
}
