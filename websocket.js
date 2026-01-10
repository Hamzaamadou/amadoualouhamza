 let io;

module.exports = (server) => {
  io = require("socket.io")(server, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
    console.log("WebSocket connecté :", socket.id);
  });
};

module.exports.broadcast = (data) => {
  if (io) io.emit("message", data);
};
