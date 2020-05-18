import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Screen from "./components/screen";

// import socketClient from "socket.io-client";

// package.json
// mac - HTTPS=true
// windows - set HTTPS=true&&

// yarn react-start
// yarn start
// yarn build

function App() {
  // const socket = socketClient("/");

  return (
    <div className="App">
      <header className="App-header">
        <Screen /> {/* socket={socket} */}
        <img src={logo} className="App-logo" alt="logo" />
      </header>
    </div>
  );
}

export default App;
