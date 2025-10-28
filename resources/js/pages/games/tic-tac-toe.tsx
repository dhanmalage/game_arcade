import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { X, Circle, RotateCcw, Trophy, Cpu, User } from 'lucide-react';

export default function TicTacToe() {
    const { auth } = usePage<SharedData>().props;
    
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ user: 0, pc: 0, draws: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return null;
  };

  const getEmptySquares = (squares) => {
    return squares.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
  };

  const minimax = (squares, depth, isMaximizing, alpha, beta) => {
    const result = calculateWinner(squares);
    
    if (result) {
      return result.winner === 'O' ? 10 - depth : depth - 10;
    }
    
    if (squares.every(s => s !== null)) {
      return 0;
    }

    const empty = getEmptySquares(squares);

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i of empty) {
        squares[i] = 'O';
        const score = minimax(squares, depth + 1, false, alpha, beta);
        squares[i] = null;
        maxScore = Math.max(score, maxScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i of empty) {
        squares[i] = 'X';
        const score = minimax(squares, depth + 1, true, alpha, beta);
        squares[i] = null;
        minScore = Math.min(score, minScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return minScore;
    }
  };

  const getBestMove = (squares) => {
    const empty = getEmptySquares(squares);
    
    // Add some randomness - 20% chance of making a suboptimal move
    const randomChance = Math.random();
    
    if (randomChance < 0.2 && empty.length > 2) {
      // Make a random move (not completely random, avoid obviously bad moves)
      const goodMoves = empty.filter(idx => {
        const testBoard = [...squares];
        testBoard[idx] = 'O';
        // Don't let user win on next move
        for (let emptyIdx of getEmptySquares(testBoard)) {
          const userTestBoard = [...testBoard];
          userTestBoard[emptyIdx] = 'X';
          if (calculateWinner(userTestBoard)) {
            return false;
          }
        }
        return true;
      });
      
      if (goodMoves.length > 0) {
        return goodMoves[Math.floor(Math.random() * goodMoves.length)];
      }
    }

    // Check for winning move
    for (let i of empty) {
      squares[i] = 'O';
      if (calculateWinner(squares)) {
        squares[i] = null;
        return i;
      }
      squares[i] = null;
    }

    // Block user's winning move
    for (let i of empty) {
      squares[i] = 'X';
      if (calculateWinner(squares)) {
        squares[i] = null;
        return i;
      }
      squares[i] = null;
    }

    // Use minimax for strategic play
    let bestScore = -Infinity;
    let bestMove = empty[0];

    for (let i of empty) {
      squares[i] = 'O';
      const score = minimax(squares, 0, false, -Infinity, Infinity);
      squares[i] = null;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }

    return bestMove;
  };

  const makeComputerMove = (currentBoard) => {
    setIsThinking(true);
    
    setTimeout(() => {
      const newBoard = [...currentBoard];
      const move = getBestMove(newBoard);
      newBoard[move] = 'O';
      setBoard(newBoard);

      const result = calculateWinner(newBoard);
      if (result) {
        setScores(prev => ({ ...prev, pc: prev.pc + 1 }));
        setGameOver(true);
      } else if (newBoard.every(square => square !== null)) {
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        setGameOver(true);
      }

      setIsXNext(true);
      setIsThinking(false);
    }, 500);
  };

  const handleClick = (i) => {
    if (board[i] || gameOver || !isXNext || isThinking) return;

    const newBoard = [...board];
    newBoard[i] = 'X';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      setScores(prev => ({ ...prev, user: prev.user + 1 }));
      setGameOver(true);
      setIsXNext(false);
      return;
    }

    if (newBoard.every(square => square !== null)) {
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      setGameOver(true);
      return;
    }

    setIsXNext(false);
    makeComputerMove(newBoard);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setIsThinking(false);
  };

  const resetScores = () => {
    setScores({ user: 0, pc: 0, draws: 0 });
    resetGame();
  };

  const result = calculateWinner(board);
  const winner = result?.winner;
  const winningLine = result?.line || [];
  const isDraw = !winner && board.every(square => square !== null);

  const getStatus = () => {
    if (winner === 'X') return "You Win! 🎉";
    if (winner === 'O') return "PC Wins! 🤖";
    if (isDraw) return "It's a Draw! 🤝";
    if (isThinking) return "PC is thinking... 🤔";
    return "Your Turn! 💭";
  };

  const renderSquare = (i) => {
    const isWinning = winningLine.includes(i);
    const value = board[i];

    return (
      <button
        onClick={() => handleClick(i)}
        disabled={isThinking}
        className={`
          aspect-square w-full flex items-center justify-center
          text-5xl font-bold rounded-2xl
          transition-all duration-300 transform
          ${!value && !gameOver && isXNext && !isThinking ? 'hover:scale-105 hover:bg-indigo-50 cursor-pointer' : 'cursor-default'}
          ${isWinning ? 'bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse' : 'bg-white'}
          ${value ? 'shadow-lg' : 'shadow-md hover:shadow-xl'}
          ${isThinking && !value ? 'opacity-50' : ''}
          border-2 border-indigo-100
        `}
      >
        {value === 'X' && (
          <X className={`w-16 h-16 ${isWinning ? 'text-white' : 'text-indigo-600'} animate-in zoom-in duration-300`} strokeWidth={3} />
        )}
        {value === 'O' && (
          <Circle className={`w-16 h-16 ${isWinning ? 'text-white' : 'text-pink-500'} animate-in zoom-in duration-300`} strokeWidth={3} />
        )}
      </button>
    );
  };

      return (
        <>
            <Head title="Tic Tac Toe" />
            
            <AppLayout className="bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100 flex items-center justify-center p-8">
                                <div className="max-w-2xl w-full">
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                    <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 mb-2">
                                        Tic Tac Toe vs PC
                                    </h1>
                                    <p className="text-gray-600 text-lg">You are X, PC is O. Can you beat the AI?</p>
                                    </div>

                                    {/* Score Board */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-indigo-200">
                                        <div className="flex items-center justify-center mb-2">
                                        <User className="w-6 h-6 text-indigo-600" strokeWidth={3} />
                                        </div>
                                        <div className="text-3xl font-bold text-center text-indigo-600">{scores.user}</div>
                                        <div className="text-sm text-center text-gray-500">You</div>
                                    </div>
                                    
                                    <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200">
                                        <div className="flex items-center justify-center mb-2">
                                        <Trophy className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <div className="text-3xl font-bold text-center text-gray-600">{scores.draws}</div>
                                        <div className="text-sm text-center text-gray-500">Draws</div>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-pink-200">
                                        <div className="flex items-center justify-center mb-2">
                                        <Cpu className="w-6 h-6 text-pink-500" strokeWidth={3} />
                                        </div>
                                        <div className="text-3xl font-bold text-center text-pink-500">{scores.pc}</div>
                                        <div className="text-sm text-center text-gray-500">PC</div>
                                    </div>
                                    </div>

                                    {/* Status */}
                                    <div className={`
                                    text-center text-2xl font-bold mb-6 p-4 rounded-xl
                                    ${winner === 'X' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 
                                        winner === 'O' ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white' :
                                        isDraw ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                                        'bg-white text-gray-700'} 
                                    shadow-lg transition-all duration-300
                                    `}>
                                    {getStatus()}
                                    </div>

                                    {/* Game Board */}
                                    <div className="bg-white rounded-3xl p-6 shadow-2xl mb-6">
                                    <div className="grid grid-cols-3 gap-4">
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                        <div key={i}>{renderSquare(i)}</div>
                                        ))}
                                    </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                    <button
                                        onClick={resetGame}
                                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        disabled={isThinking}
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        New Game
                                    </button>
                                    
                                    <button
                                        onClick={resetScores}
                                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        disabled={isThinking}
                                    >
                                        <Trophy className="w-5 h-5" />
                                        Reset Scores
                                    </button>
                                    </div>
                                </div>
            </AppLayout>
        </>
    );
}
