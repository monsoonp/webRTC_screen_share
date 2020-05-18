const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const p2p = require("socket.io-p2p-server").Server;

app.use(express.json()); // http api - json 허용

// server side rendering
/*
app.use(express.static(__dirname, "/public"));
app.get("/", (req, res) => {
    res.redirect("index.html");
});
*/

io.use(p2p); // socket.io peer to peer

io.on("connection", (socket) => {
  console.log("New client connected : ", socket.id);

  socket.on("message", (message) => {
    // handle message...
    // clients.forEach(c => c.emit("message", message));
    socket.broadcast.emit("message", message); //, broadcast 나 이외 다른 소켓에
  });
  socket.on("stream", (video) => {
    socket.broadcast.emit("stream", video);
  });

  socket.on("peer-msg", function (data) {
    console.log("Message from peer: %s", data);
    socket.broadcast.emit("peer-msg", data);
  });

  socket.on("go-private", function (data) {
    socket.broadcast.emit("go-private", data);
  });

  // socket 연결 해제시
  socket.on("disconnect", () => {
    console.log("Client disconnected : %s", socket.id);
  });

  socket.on("error", (err) => {
    console.log("received error from client : %s", socket.id, err);
  });
});

server.listen(5000, () => {
  console.log("server: ", server.address());
});
