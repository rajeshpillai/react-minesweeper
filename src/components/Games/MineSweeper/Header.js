import React from 'react';

const Header = ({ smiley, isDebug, onDebug, onReset }) => {
    return (
        <header className="header">
            <div className="row">
                <div className="col flex-wrapper">
                    <span className="header-title">
                        Minesweeper Classic{" "}
                    </span>
                </div>
                <div className="col flex-wrapper">
                    <div className=" smiley reset" title="click to start the game..."
                        onClick={e => {
                            onReset(e);
                        }}>
                        {smiley}
                    </div>
                </div>
                <div className="col flex-wrapper">
                    <div className="checkbox-btn">
                        <input type="checkbox" className="chkBox" checked={isDebug} onChange={onDebug} />
                        <div>
                            <span className="slide" />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
