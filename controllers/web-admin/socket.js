var host = require("../../config/http");

const socket = require("socket.io-client")(`${host.HOST_HTTPS}`, {
  transports: ["websocket", "polling", "flashsocket"],
  secure: true,
  reconnect: true,
  rejectUnauthorized: false,
});
const socketHttp = require("socket.io-client")(`${host.HOST_HTTP}`, {
  transports: ["websocket", "polling", "flashsocket"],
});
socket.on("connect", function () {
  console.log("Connected https");
});

socketHttp.on("connect", function () {
  console.log("Connected http");
});

module.exports = {
  socket,
  socketHttp
};
