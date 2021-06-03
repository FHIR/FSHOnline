import React from 'react';
import { Route, Switch } from 'react-router-dom';
import App from '../App';

export default function AppRouter(props) {
  return (
    <Switch>
      <Route path="/share/:text" component={App} />
      <Route path="" exact component={App} />
    </Switch>
  );
}
