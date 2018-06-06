const electron = require('electron');
const url = require('url');
const path = require('path');
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const ip = require('ip');
const mime = require('mime');

const {app, BrowserWindow, ipcMain} = electron;

let main = {};

// Start main
app.on('ready', function () {
  main = new BrowserWindow({
    //fullscreen: true,
    //frame: false
  });
  main.loadURL(url.format({
    pathname: path.join(__dirname, '/main/index.html'),
    protocol: 'file',
    slashes: true
  }));
  main.on('close', function () {
    app.quit();
  });
  // Start controller server
  const server = http.createServer(function (req, res) {
    let URL = url.parse(req.url);
    if (URL.path[URL.path.length - 1] === "/")  URL.path += "index.html";
    fs.readFile("./controller" + URL.path, function (err, data) {
      if (err) {
        res.writeHead(500);
        res.end("Server Error");
      }
      else {
        res.writeHead(200, {
          'Content-Length': Buffer.byteLength(data),
          'Content-Type': mime.getType("./controller" + URL.path)
        });
        res.end(data);
      }
    });
  });
  const io = socketio(server);
  io.on('connection', function (socket) {
    require('./controller/socket.js')(socket, main, ipcMain);
  });
  server.listen(9577, function (err) {
    if (err) throw err;
    console.log(`The controller server is active on http://${ip.address()}:9577`);
    main.webContents.send('controllers::ready');
  });
});
