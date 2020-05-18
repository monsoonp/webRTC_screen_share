const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { transports: ["websocket"] });
const port = process.env.port || 5000;

const path = require("path");

app.use(express.json()); // http api - json 허용

// server side rendering
/*
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
    res.redirect("index.html");
});
*/
app.get("/static/:file", (req, res) => {
  const { file } = req.params;
  // console.log(path.join(__dirname, `../src/Utils/${file}`));
  res.sendFile(path.join(__dirname, `../src/Utils/${file}`));
});

io.on("connection", (socket) => {
  console.log("New client connected : ", socket.id);

  socket.on("message", (message) => {
    // handle message...
    // clients.forEach(c => c.emit("message", message));
    socket.broadcast.emit("message", message); //, broadcast 나 이외 다른 소켓에
  });

  // socket 연결 해제시
  socket.on("disconnect", () => {
    console.log("Client disconnected : %s", socket.id);
  });

  socket.on("error", (err) => {
    console.log("received error from client : %s", socket.id, err);
  });
});

server.listen(port, () => {
  console.log("server: ", server.address());
});
