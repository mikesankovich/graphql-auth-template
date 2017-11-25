import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import {ApolloProvider } from 'react-apollo';
import { Router, hashHistory, Route, IndexRoute } from 'react-router';

import App from './components/App';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Dashboard from './components/Dashboard';
import DashboardDynamic from './components/DashboardDynamic';
import Submission from './components/Submission';
import FrontPage from './components/FrontPage';

// HOC
import requireAuth from './components/HOC/requireAuth';

const networkInterface = createNetworkInterface({
  uri: '/graphql',
  opts: { credentials: 'same-origin' },
})

const client = new ApolloClient({
  dataIdFromObject: o => o.id,
  networkInterface,
});

const Root = () => {
  return (
    <ApolloProvider client={client}>
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <IndexRoute component={requireAuth(Dashboard)}></IndexRoute>
          <Route path="/submissions" component={DashboardDynamic}>
            <IndexRoute component={FrontPage}></IndexRoute>
          </Route>
          <Route path="login" component={LoginForm}></Route>
          <Route path="signup" component={SignupForm}></Route>
          <Route path="/:id" component={Submission}></Route>
        </Route>
      </Router>
    </ApolloProvider>
  );
};

ReactDOM.render(<Root />, document.querySelector('#root'));
