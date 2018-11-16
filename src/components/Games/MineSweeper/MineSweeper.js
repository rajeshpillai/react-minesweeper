
import React from 'react';
import Cell from './Cell';
import { make2DArray } from './utils.js';
import './minesweeper.css';

export default class MineSweeper extends React.Component {

    constructor(props) {
        super(props);
        this.width = 200;
        this.height = 200;
        this.cols = 8;
        this.rows = 8;
        this.target = 0;
        this.mines = 0;
        this.state = {
            grid: [],
            won: null,
            inprogress: false,
            target: 0,
            debug: false,
            level: 1,
            size: 8,
        }
    }

    componentDidMount() {
        this.initGame();
    }


    initGame() {
        this.mines = 0;
        this.cols = this.state.size;
        this.rows = this.state.size;
        this.target = 0;

        let grid = make2DArray(this.cols, this.rows);
        let level = this.state.level;

        this.setState({
            loading: true,
            level: level,
            over: false,
            won: null
        });

        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                let m = Math.random(1);
                let isMine = m < (level * 10 / 100) ? true : false; // 70% of blocks has mines
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
                this.countMines(grid, x, y);
            }
        }
        this.setState({
            grid,
            won: null,
            inprogress: true
        }, () => {
            this.setState({
                loading: false,
                target: this.target
            })
        });
    }

    countMines(grid, x, y) {
        let cell = grid[x][y];

        let neighborCount = 0;

        if (cell.mine) {
            return;
        }

        for (let x1 = -1; x1 <= 1; x1++) {
            if (x + x1 < 0 || x + x1 >= grid.length) {
                continue;
            }

            for (let y1 = -1; y1 <= 1; y1++) {
                if (y + y1 < 0 || y1 + y1 >= grid.length) {
                    continue;
                }
                let ncell = grid[x + x1][y + y1];
                if (ncell == null) continue;
                if (ncell.mine) {
                    neighborCount++;
                }
            }
        }
        cell.neighborCount = neighborCount;
    }

    floodFill(grid, c, r) {
        let cell = grid[c][r];
        console.log("Flood filling for ", c, r);

        let neighborCount = 0;

        if (cell.mine) {
            console.log("mine found...");
            return;
        }

        for (let x = -1; x <= 1; x++) {
            if (c + x < 0 || c + x >= grid.length) {
                continue;
            }
            for (let y = -1; y <= 1; y++) {
                if (r + y < 0 || r + y >= grid.length) {
                    continue;
                }
                let ncell = grid[c + x][r + y];
                if (ncell && !ncell.revealed) {
                    this.reveal(ncell, c + x, r + y);
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

        grid[x][y] = cell;
        console.log("cell.neighCount:", cell.neighborCount);
        if (cell.neighborCount == 0) {
            this.floodFill(grid, x, y);
        }

        this.setState({
            grid,
            target: this.target,
            won: this.target <= 0 ? true : null
        });
    }

    gameOver(won) {
        let grid = [...this.state.grid];

        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                grid[x][y].revealed = true;
                grid[x][y].won = won;
            }
        }
        this.setState({
            grid,
            won: won,
            over: true
        });
    }

    onCellClick(cell) {
        if (this.state.over) return;

        if (cell.mine) {
            this.gameOver(false);
            this.setState({
                won: false
            });
            //alert("You lost..");
            return;
        }
        this.setState({
            target: this.state.target - 1,
            won: null
        });
        console.log("neighbour: ", cell.neighborCount);
        this.reveal(cell, cell.position.x, cell.position.y);
    }

    onReset() {
        this.initGame();
    }

    onDebug = () => {
        this.setState({
            debug: !this.state.debug
        })
    }

    onLevelSliderChange = (e) => {
        this.setState({ level: parseInt(e.target.value) }, () => {
            this.initGame();
        });
    }

    onSizeChange = (e) => {
        this.setState({
            size: parseInt(e.target.value, 10)
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
        console.log(this.state, `win: ${won}`);
        let isDebug = this.state.debug;


        { { loading && <h2>loading...</h2> } }

        var rows = grid.map((item, i) => {
            var entry = item.map((element, j) => {
                let mine = element.random < 0.5 ? true : false;
                let flag = element.won;
                return (
                    <td key={i + j} >
                        <Cell
                            onCellClick={(e) => { this.onCellClick(e) }}
                            revealed={element.revealed}
                            mine={element.mine}
                            position={{ y: j, x: i }}
                            debug={isDebug}
                            won={flag}
                            neighborCount={element.neighborCount}
                            index={j} />
                    </td>);
            });
            return (
                <tr key={i}>{entry}</tr>
            );
        });

        let gameUI = <React.Fragment>
            {/* Header - Start */}
            <header className="header">
                <div className="row">
                    <div className="col flex-wrapper">
                        <span className="header-title">
                            Minesweeper Classic{" "}
                        </span>
                    </div>
                    <div className="col flex-wrapper">
                        <div className=" smiley reset" title="click to start the game..." onClick={e => {
                            this.onReset(e);
                        }}>
                            {smiley}
                        </div>
                    </div>
                    <div className="col flex-wrapper">
                        <div className="checkbox-btn">
                            <input type="checkbox" className="chkBox" checked={isDebug} onChange={this.onDebug} />
                            <div>
                                <span className="slide" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            {/* Header - End */}

            <div className="info-bar">
                <div className="row">
                    <div className="col flex-wrapper-info-bar">
                        <label className="col-form-label">Mines</label>
                        <div className="info-value">{this.mines}</div>
                    </div>
                    <div className="col flex-wrapper-info-bar">
                        <label className="col-form-label">Safe cells</label>
                        <div className="info-value">
                            {target} {this.target == 0 && <span>You won!</span>}
                        </div>
                        {/* Safe cells: {target} {this.target == 0 && <span>You won!</span>} */}
                    </div>
                    <div className="col flex-wrapper-info-bar">
                        <label className="col-form-label">Size</label>
                        <div className="info-value">
                            <input type="number" step="2" value={this.state.size} min="4" max="16" onChange={this.onSizeChange} />
                        </div>
                    </div>

                    <div className="col flex-wrapper-info-bar">
                        <label className="col-form-label">Level</label>
                        <div className="info-value">
                            <input ref={slider => {
                                this.slider = slider;
                            }} type="range" onChange={this.onLevelSliderChange} value={this.state.level} min="1" max="9" step="1" /> {this.state.level}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="board">
                    <div className="table-responsive">
                        <table className="table">
                            <tbody>{rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>



        </React.Fragment>;

        let gameView = loading ? "<h2>loading...</h2>" : gameUI;

        return (
            gameView
        );
    }
}