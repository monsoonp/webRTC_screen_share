import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Screen from "components/Screen";

const Main = ({ socket }) => {
  return (
    <Switch>
      <Route
        path={[`/`, `/home`, `/Screen-Share`]}
        render={(props) => <Screen {...props} socket={socket} />}
      />
      <Redirect from={`/`} to={`/Screen-Share`} />
    </Switch>
  );
};

export default Main;
