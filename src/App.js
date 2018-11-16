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
    return <React.Fragment>
      <MineSweeper />
      <footer className="footer">
        <div className="container">
          <div className="text-center">
            <div className="text-muted text-center">
              click đ on the header to start again.
              </div>
            <div>
              Inspired from The Coding Train p5js video
                  <a href="https://www.youtube.com/watch?v=LFU5ZlrR21E">
                The Coding Train
                  </a>
            </div>
          </div>
        </div>
      </footer>
    </React.Fragment>;
  }
}

