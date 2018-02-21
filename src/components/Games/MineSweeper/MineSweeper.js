
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
    mines = 0;
    state = {
        grid:  [],
        won: null,
        inprogress: false,
        target: 0,
        debug: false,
        level: 1 ,
        size: 8,
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
        this.mines = 0;
        this.cols = this.state.size;
        this.rows = this.state.size;

        let grid = make2DArray(this.cols,this.rows);
        let level = this.state.level;

        this.target = 0;


        this.logState({
            loading: true,
            level: level,
            over: false,
            won: null
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
                } else {
                    this.mines++;
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
            won: null,
            inprogress: true
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
            console.log("mine found...");
            this.neighborCount = -1;  // no need for count
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
                if (ncell && !ncell.revealed) {
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
        console.log("cell.neighCount:", cell.neighborCount);
        if (cell.neighborCount == 0) {
            this.floodFill(grid, x, y);
        }
        
        this.logState({
            grid,
            target: this.target,
            won: this.target <= 0 ? true : null
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
            this.logState({
                won: false
            });
                //alert("You lost..");
            return;
        }
        this.logState({
            target: this.state.target -1,
            won: null
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
        this.logState({level: parseInt(e.target.value)}, () => {
            this.initGame();
        });
    }

    onSizeChange = (e) => {
        this.logState({
            size: parseInt(e.target.value,10)
        }, () => {
            this.initGame();
        });

    }

    render() {
        let grid = this.state.grid;
        let won = this.state.won;
        let inprogress = this.state.inprogress;
        let loading = this.state.loading;
        let target = this.state.target;
        let smiley = (won == null || won == true) ? "🙂" : "🙁";
        console.log(this.state,`win: ${won}`);
        let isDebug = this.state.debug;


        {{ loading && <h2>loading...</h2>}}

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
        <React.Fragment>
            <div className="row">
                <header className="col header">
                    <h3 className="header-title">Minesweeper Classic 
                    <span className="pull-right">
                            <label className="checkbox">
                                    <input type="checkbox" 
                                    checked={isDebug}
                                    onChange={this.onDebug} /> debug
                                </label> 
                           </span>
                           </h3> 
                       <h6 className="text-center">
                            <span className="smiley reset" title="click to start the game..."
                                onClick={(e)=>{this.onReset(e)}}>{smiley}
                            </span>
                       </h6>
                </header>
            </div>
           
            <div className="row">
                <div className="board">
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                {rows}
                            </tbody>
                        </table>    
                    </div>
                </div>
                <div className="settings">
                   <div className="row">
                        <div className="col">
                            <div>Mines</div>
                            <div>{this.mines}</div>
                         </div>
                         <div className="col">
                             <div>Safe cells</div>
                             <div>{target} {this.target == 0 && <span>You won!</span>}</div>
                            {/* Safe cells: {target} {this.target == 0 && <span>You won!</span>} */}
                        </div>
                        <div className="col">
                            <div>Size</div>
                            <div>
                                <input type="number" step="2" value={this.state.size} min="4" max="16"
                                onChange = {this.onSizeChange}/>
                            </div>
                        </div>
                   
                        <div className="col">
                            <div>Level</div>
                            <div><input ref={(slider)=>{this.slider=slider}} 
                                type="range" 
                                onChange={this.onLevelSliderChange}
                                value={this.state.level}
                                min="1" max="9" step="1" /> {this.state.level}</div>
                        </div>
                    </div>
                </div>
             </div>
            <footer>
                <div className="row">
                    <div className="col-sm-12">
                    Press alt+shift+r (to replay)->click 🙂 on the header to start again.
                    </div>
                </div>
            </footer>
        </React.Fragment>
            
        );

        let gameView = loading ? "<h2>loading...</h2>" : gameUI;

        return (
            gameView
        );
    }
}