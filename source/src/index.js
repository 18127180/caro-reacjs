import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

// var boardSize = 20;

function Square(props) {
  // 5. When someone wins, highlight the three squares that caused the win.
  const className = 'square' + (props.highlight ? ' highlight' : '');
  return (
    <button
      className={className}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winLine && winLine.includes(i)}
      />
    );
  }

  render() {
    // 3. Rewrite Board to use two loops to make the squares instead of hardcoding them. Rewrite winning rule to 5 consecutive squares.
    let squares = [];
    for (let i = 0; i < this.props.size; ++i) {
      let row = [];
      for (let j = 0; j < this.props.size; ++j) {
        row.push(this.renderSquare(i * this.props.size + j));
      }
      squares.push(<div key={i} className="board-row">{row}</div>);
    }

    return (
      <div>{squares}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(25).fill(null)
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true,
      boardSize: 5
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares, this.state.boardSize).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          // Store the index of the latest moved square
          latestMoveSquare: i
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  handleSortToggle() {
    this.setState({
      isAscending: !this.state.isAscending
    });
  }

  handleChangeBoardSize(event) {
    if (Number(event.target.value) >= 5)
    {
      this.setState(
        { 
          boardSize: Number(event.target.value),
          history: [
            {
              squares: Array(25).fill(null)
            }
          ],
          stepNumber: 0,
          xIsNext: true,
          isAscending: true
        });
    }
  }



  render() {
    const history = this.state.history;
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const winInfo = calculateWinner(current.squares, this.state.boardSize);
    const winner = winInfo.winner;

    let moves = history.map((step, move) => {
      const latestMoveSquare = step.latestMoveSquare;
      const col = 1 + latestMoveSquare % 5;
      const row = 1 + Math.floor(latestMoveSquare / 5);
      // 1. Display the location for each move in the format (col, row) in the move history list.
      const desc = move ?
        `Go to move #${move} (${col}, ${row})` :
        'Go to game start';
      return (
        <li key={move}>
          {/* 2. Bold the currently selected item */ }
          <button
            className={move === stepNumber ? 'move-list-item-selected' : ''}
            onClick={() => this.jumpTo(move)}>{desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = "Winner: " + winner;
    } else {
      if (winInfo.isDraw) {
        status = "Draw";
      } else {
        status = "Next player: " + (this.state.xIsNext ? "X" : "O");
      }
    }

    const isAscending = this.state.isAscending;
    if (!isAscending) {
      moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={i => this.handleClick(i)}
            winLine={winInfo.line}
            size={Number(this.state.boardSize)}
          />
        </div>
        <div className="game-info">
          <input
            type="number"
            name="clicks"
            value={Number(this.state.boardSize).toString()}
            onChange={(event) => this.handleChangeBoardSize(event)}
          />
        {/* 6. When no one wins, display a message about the result being a draw. */}
          <div>{status}</div>
          {/* 4. Add a toggle button that lets you sort the moves in either ascending or descending order. */}
          <button onClick={() => this.handleSortToggle()}>
            {isAscending ? 'descending' : 'ascending'}
          </button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares, boardSize) {
  // const lines = [
  //   [0, 1, 2, 3, 4 ],
  //   [5, 6, 7, 8, 9],
  //   [10, 11, 12, 13, 14],
  //   [15, 16, 17, 18, 19],
  //   [20, 21, 22, 23, 24],

  //   [0, 5, 10, 15, 20],
  //   [1, 6, 11, 16, 21],
  //   [2, 7, 12, 17, 22],
  //   [3, 8, 13, 18, 23],
  //   [4, 9, 14, 19, 24],

  //   [0, 6, 12, 18, 24],
  //   [4, 8, 12, 16, 20]
  // ];

  let lines = [];

  for (let i = 0;i<boardSize;i++)
  {
    for (let j = 0; j<boardSize;j++)
    {
      if (boardSize - j >= 5){
        lines.push([boardSize*i + j, boardSize*i + j + 1, boardSize*i + j + 2,boardSize*i + j + 3,boardSize*i + j + 4]);
        lines.push([i + boardSize * j, i + boardSize * (j + 1) ,i + boardSize * (j + 2),i + boardSize * (j + 3),i + boardSize * (j + 4)]);
        if (boardSize - i >= 5){
          lines.push([i * boardSize + j, (i + 1) * boardSize + j + 1, (i + 2) * boardSize + j + 2, (i + 3) * boardSize + j + 3, (i + 4) * boardSize + j + 4]);
          lines.push([i * boardSize + (4 + j), (i + 1) * boardSize + (3 + j), (i + 2) * boardSize + (2 + j), (i + 3) * boardSize + (1 + j), (i + 4) * boardSize + j]);
        }
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d, e] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d] && squares[a] === squares[e]) {
      return {
        winner: squares[a],
        line: lines[i],
        isDraw: false,
      };
    }
  }

  let isDraw = true;
  for (let i = 0; i < squares.length; i++) {
    if (squares[i] === null) {
      isDraw = false;
      break;
    }
  }
  return {
    winner: null,
    line: null,
    isDraw: isDraw,
  };
}
