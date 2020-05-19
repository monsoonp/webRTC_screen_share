const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { transports: ["websocket"] });
const port = process.env.PORT || 5000;

const path = require("path");

app.use(express.json()); // http api - json 허용 // express 빌트인 body-parser - post requestr의 data 추출

// server side rendering
/*
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
  res.sendFile("index.html");
});
app.get("/static/:file", (req, res) => {
  const { file } = req.params;
  // console.log(path.join(__dirname, `../src/Utils/${file}`));
  res.sendFile(path.join(__dirname, `../src/Utils/${file}`));
});
*/
let activeSockets = [];
let isStreaming = false;

app.get("/isStreaming", (req, res) => {
  res.send(isStreaming);
});
app.get("/onStreaming", (req, res) => {
  res.send("Screen Share Streaming Started");
  isStreaming = true;
});

io.on("connection", (socket) => {
  // 소켓 연결시 기존 목록에 있는 소켓인지 확인
  const existingSocket = activeSockets.find(
    (existingSocket) => existingSocket === socket.id
  );
  console.log("New client connected : ", socket.id);

  // 기존에 없던 소켓 id 추가
  if (!existingSocket) {
    activeSockets.push(socket.id);
    // 추가된 소켓에게 자신 이외 목록 전달
    socket.emit("update-user-list", {
      users: activeSockets.filter(
        (existingSocket) => existingSocket !== socket.id
      ),
    });
    // 추가된 소켓 이외 나머지에게 추가된 소켓 전달
    socket.broadcast.emit("update-user-list", {
      users: [socket.id],
    });
  }

  socket.on("call-user", (data) => {
    // console.log("call-user", socket.id, data);
    socket.to(data.to).emit("call-made", {
      offer: data.offer,
      socket: socket.id,
    });
  });

  socket.on("make-answer", (data) => {
    socket.to(data.to).emit("answer-made", {
      socket: socket.id,
      answer: data.answer,
    });
  });

  socket.on("reject-call", (data) => {
    socket.to(data.from).emit("call-rejected", {
      socket: socket.id,
    });
  });
  // socket 연결 해제시
  socket.on("disconnect", () => {
    console.log("Client disconnected : %s", socket.id);
    // 소켓 목록에서 연결 해제된 소켓 제외
    activeSockets = activeSockets.filter(
      (existingSocket) => existingSocket !== socket.id
    );
    // 연결 해제된 소켓 전달
    socket.broadcast.emit("remove-user", {
      socketId: socket.id,
    });
  });

  socket.on("error", (err) => {
    console.log("received error from client : %s", socket.id, err);
  });
});

server.listen(port, () => {
  console.log("server: ", server.address());
});
