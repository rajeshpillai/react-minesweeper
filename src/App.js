import React, { Component } from 'react';
import ReactDOM from "react-dom";

import MineSweeper from "./components/Games/MineSweeper/MineSweeper";

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
    }
  }

  render() {
    return (
      <div className="App">
        <MineSweeper width="200px" />
      </div>
    );
  }
}

