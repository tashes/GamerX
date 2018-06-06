let Players = {};

module.exports = function (socket, window, ipcMain) {
  if (Players[socket.id] === undefined) {
    window.webContents.send('controllers::new', socket.id);
    Players[socket.id] = socket;
  }
  socket.on('disconnecting', function () {
    if (Players[socket.id]) {
      window.webContents.send('controllers::leave', socket.id);
      delete Players[socket.id];
    }
  });
  socket.on('touch', function () {
    window.webContents.send('touch', socket.id);
  });
};
