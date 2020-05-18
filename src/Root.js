import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import io from "socket.io-client";

import Main from "shared/Main";
import adapter from "webrtc-adapter";

// import socketClient from "socket.io-client";

// package.json
// mac - HTTPS=true
// windows - set HTTPS=true&&

function Root() {
  let pathAddress;
  if (process.env.PUBLIC_URL) {
    pathAddress = process.env.PUBLIC_URL;
  } else {
    pathAddress = "http://127.0.0.1:5000";
  }
  const socket = io(pathAddress, { transports: ["websocket"] });

  useEffect(() => {
    if (socket) {
      console.log("socket connected");
    }
  });

  return (
    <BrowserRouter basename={pathAddress}>
      <Main socket={socket} />
    </BrowserRouter>
  );
}

export default Root;
