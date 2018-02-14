
import React from 'react';
import Cell from './Cell';
import {make2DArray} from './utils.js';
import './minesweeper.css';

export default class MineSweeper extends React.Component {
    width = 200;
    height = 200;
    cols = 8;
    rows = 8;
    target = 0;
    
    state = {
        grid:  [],
        won: false,
        target: 0,
        debug: true,
        level: 1 
    }
    

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.onkeydown = (e) => {
            if (e.altKey && e.shiftKey && e.which === 82) { // ALT+SHIFT+R(eplay)
             this.replay();
            }
        }
        this.initGame();
    }


    initGame() {
        let grid = make2DArray(this.cols,this.rows);
        let level = this.state.level;

        this.target = 0;


        this.logState({
            loading: true,
            level: level,
            over: false
        });
        
        for(let x = 0; x < this.cols; x++) {
            for(let y = 0; y < this.rows; y++) {
                let m = Math.random(1);
                let isMine = m < (level * 10 / 100) ? true: false; // 70% of blocks has mines
                grid[x][y] = {
                    random: m,
                    mine: isMine,  
                    position: {
                        x: x,
                        y: y
                    }
                };

                if (!isMine) {
                    this.target++;
                }
            }
        }
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
              this.countMines(grid,x,y);
            }
        }
        this.logState({
            grid,
            won: true
        }, ()=> {
            this.logState({
                loading: false,
                target: this.target
            })
        });
    }

    countMines(grid, x, y) {
        let cell = grid[x][y];
        
        let neighborCount  = 0;

        if (cell.mine) {
            this.neighborCount = -1;
            return;
        }

        for(let x1 = -1; x1 <= 1; x1++) {
            if (x+x1 < 0 ||x+x1 >= grid.length) {
                continue;
            }
               
            for(let y1 = -1; y1 <=1; y1++) {
                if (y+y1 <0 || y1+y1 >= grid.length) {
                    continue;
                }
                let ncell = grid[x+x1][y+y1];
                if (ncell == null) continue;
                if (ncell.mine) {
                    neighborCount ++;
                }
            }
        }
        cell.neighborCount  = neighborCount ;
    }

    floodFill(grid, c, r) {
        let cell = grid[c][r];
        console.log("Flood filling for ", c, r);
        
        let neighborCount  = 0;

        if (cell.mine) {
            this.neighborCount = -1;
            return;
        }

        for(let x = -1; x <= 1; x++) {
            if (c+x < 0 ||c+x >= grid.length) {
                continue;
            }
               
            for(let y = -1; y <=1; y++) {
                if (r+y <0 || r+y >= grid.length) {
                    continue;
                }
                let ncell = grid[c+x][r+y];
                if (!ncell.revealed) {
                    this.reveal(ncell, c+x, r+y);
                }
            }
        }
    }

    reveal(cell, x, y) {
        let grid = [...this.state.grid];
        console.log("Revealing: ", cell.position.x, cell.position.y);

        cell.revealed = true;
        
        this.target--;

        if (this.target == 0) {
            // won
            this.gameOver(true);
            return;
        }

        grid[x][y]= cell;
        if (cell.neighborCount == 0) {
            this.floodFill(grid, x, y);
        }
        
        this.logState({
            grid,
            target: this.target,
            won: this.target <= 0
        });
    }

    _log = [];
    logState=(newState, onUpdate)=> {
        // remember the old state in a clone
        if (this._log.length === 0) {
            this._log.push(this.state);
        }
        this._log.push(newState);
        if (onUpdate) {
            this.setState(
                newState, onUpdate);
        } else {
            this.setState(
                newState
            );
        }
    }

    replay = () => {
        console.log("replaying...", this._log);
        if (this._log.length === 0) {
            console.warn("No state to replay yet");
            return;
        }
        var idx = -1;
        var interval = setInterval (() => {
            idx++;
            if (idx === this._log.length -1) {
                clearInterval(interval);
            }
            this.setState(this._log[idx]);
        }, 1000);
    }

    gameOver(won) {
        let grid = [...this.state.grid];

        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
              grid[x][y].revealed = true;
              grid[x][y].won = won;
            }
        }
        this.logState({
            grid,
            won: won,
            over: true
        });
    }
    
    onCellClick(cell) {
        if (this.state.over) return;
        
        if (cell.mine) {
            this.gameOver(false);
            //alert("You lost..");
            return;
        }
        this.logState({
            target: this.state.target -1
        });
        console.log("neighbour: ", cell.neighborCount);
        this.reveal(cell, cell.position.x, cell.position.y);
    }

    onReset() {
        this.initGame();
    }

    onDebug = () =>{
        this.logState({
            debug: !this.state.debug
        })
    }

    onLevelSliderChange = (e) => {
        this.logState({level: e.target.value});
    }

    render() {
        let grid = this.state.grid;
        let won = this.state.won;
        let loading = this.state.loading;
        let target = this.state.target;
        let smiley = won ? "🙂" : "🙁";
        let isDebug = this.state.debug;

        var rows = grid.map((item,i) =>{
            var entry = item.map((element,j) => {
             let mine = element.random < 0.5 ? true: false;
             let flag = element.won;
              return (
                  <td  key={i+j} >
                    <Cell  
                     onCellClick = {(e)=>{this.onCellClick(e)}}
                     revealed = {element.revealed}
                     mine={element.mine} 
                     position={{y:j, x:i}}
                     debug={isDebug}
                     won={flag}
                     neighborCount ={element.neighborCount}
                     index={j}/>
                </td>);
            });
            return (
                <tr key={i}>{entry}</tr>
             );
        });

        let gameUI =  (
            <div>
                {target} -> {this.target == 0 && <span>You won!</span>}
                Level: <input ref={(slider)=>{this.slider=slider}} 
                    type="range" 
                    onChange={this.onLevelSliderChange}
                    value={this.state.level}
                    min="1" max="9" step="1" /> {this.state.level}
                <header className="header">Minesweepr classic 
                        <span className="reset" title="click to start the game..."
                            onClick={(e)=>{this.onReset(e)}}>{smiley}
                        </span>
                        <input type="checkbox" 
                            checked={isDebug}
                            onChange={this.onDebug} /> debug
                </header>
                <table>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
                <footer>press alt+shift+r (to replay)->click 🙂 on the header to start again.</footer>

            </div>
        );

        let gameView = loading ? "<h2>loading...</h2>" : gameUI;

        return (
            gameView
        );
    }
}