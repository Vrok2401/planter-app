import React, { Component } from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import MainPage from "./pages/MainPage";

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={MainPage}></Route>
          <Route exact path="/home" component={MainPage}></Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
