const express = require("express");

const createServer = (app) => {
  const server = express();
  server.use(express.json());

  server.get("/test", (req, res) => {
    // res.writeHead(200, { "Content-Type": "text/json;charset=utf-8" });
    // res.end('{"testcode":"200", "text":"Electorn Test~"}');
    res.send(app.respondToClient(req));
  });

  server.listen(5500, () => {
    console.log("server: ", server.address());
  });
};

export default createServer;
