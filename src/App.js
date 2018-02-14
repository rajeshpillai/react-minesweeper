import React, { Component } from 'react';
import ReactDOM from "react-dom";
import './App.css';
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

        <footer>Inspired from The Coding Train p5js video 
          https://www.youtube.com/watch?v=LFU5ZlrR21E
        </footer>

      </div>
    );
  }
}

