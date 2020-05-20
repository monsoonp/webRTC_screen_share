import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Screen from "components/Screen";
// bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

const Main = ({ socket }) => {
  let isAlreadyCalling = false;
  return (
    <Switch>
      <Route
        path={[`/`, `/home`, `/Screen-Share`]}
        render={(props) => (
          <Screen
            {...props}
            socket={socket}
            isAlreadyCalling={isAlreadyCalling}
          />
        )} //
      />
      <Redirect from={`/`} to="/home" />
    </Switch>
  );
};

export default Main;
