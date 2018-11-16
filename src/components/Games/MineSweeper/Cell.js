
import React from 'react';

export default class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.mine = props.mine ? true : false;
        this.position = props.position;
        this.neighborCount = props.neighborCount;
    }

    onCellClick(e) {
        this.props.onCellClick(this);
    }

    render() {
        let mine = this.props.mine;
        let revealed = this.props.revealed;
        let neighborCount = this.props.neighborCount;
        let showMine = (mine && revealed);
        let won = this.props.won;
        let isDebug = this.props.debug;
        return (
            <div className={"cell " + (revealed ? "revealed" : "")}
                onClick={(e) => { this.onCellClick(e) }}>
                {revealed && neighborCount}
                {showMine && won &&
                    <span className="mine">&#x26F3;</span>
                }
                {showMine && !won &&
                    <span className="mine">&#x26C7;</span>
                }

                {isDebug && <span>{mine.toString().substr(0, 1)}</span>}
            </div>
        );
    }
}