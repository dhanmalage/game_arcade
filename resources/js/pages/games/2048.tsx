import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';
type Grid = number[][];

interface PageProps {
    auth: {
        user: any;
    };
}

export default function Game2048({ auth }: PageProps) {
    const [board, setBoard] = useState<number[][]>([]);
    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

  const initBoard = useCallback(() => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    return newBoard;
  }, []);

  useEffect(() => {
    setBoard(initBoard());
    const saved = localStorage.getItem('2048-best');
    if (saved) setBestScore(parseInt(saved));
  }, [initBoard]);

  const addRandomTile = (grid: Grid) => {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length > 0) {
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moveLeft = (grid: Grid): { grid: Grid; moved: boolean; points: number } => {
    let moved = false;
    let points = 0;
    const newGrid = grid.map(row => {
      const filtered = row.filter(val => val !== 0);
      const merged = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          const val = filtered[i] * 2;
          merged.push(val);
          points += val;
          if (val === 2048) setWon(true);
          i += 2;
          moved = true;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }
      while (merged.length < 4) merged.push(0);
      if (JSON.stringify(row) !== JSON.stringify(merged)) moved = true;
      return merged;
    });
    return { grid: newGrid, moved, points };
  };

  const rotateBoard = (grid: Grid): Grid => {
    const n = grid.length;
    return grid[0].map((_, i) => grid.map(row => row[i]).reverse());
  };

  const move = (dir: Direction) => {
    if (gameOver) return;
    
    let grid = board.map(row => [...row]);
    let rotations = 0;

    if (dir === 'up') rotations = 3;
    else if (dir === 'right') rotations = 2;
    else if (dir === 'down') rotations = 1;

    for (let i = 0; i < rotations; i++) {
      grid = rotateBoard(grid);
    }

    const { grid: movedGrid, moved, points } = moveLeft(grid);

    for (let i = 0; i < (4 - rotations) % 4; i++) {
      grid = rotateBoard(movedGrid);
    }

    if (moved) {
      addRandomTile(grid);
      setBoard(grid);
      const newScore = score + points;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem('2048-best', newScore.toString());
      }
      
      if (isGameOver(grid)) {
        setGameOver(true);
      }
    }
  };

  const isGameOver = (grid: Grid): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (grid[r][c] === 0) return false;
        if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
        if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const dirMap: Record<string, Direction> = {
          ArrowLeft: 'left',
          ArrowRight: 'right',
          ArrowUp: 'up',
          ArrowDown: 'down'
        };
        const direction = dirMap[e.key];
        if (direction) move(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const resetGame = () => {
    setBoard(initBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const getTileColor = (val: number): string => {
    const colors: Record<number, string> = {
      0: 'bg-gray-200',
      2: 'bg-amber-100',
      4: 'bg-amber-200',
      8: 'bg-orange-300',
      16: 'bg-orange-400',
      32: 'bg-orange-500',
      64: 'bg-red-400',
      128: 'bg-yellow-300',
      256: 'bg-yellow-400',
      512: 'bg-yellow-500',
      1024: 'bg-yellow-600',
      2048: 'bg-yellow-700'
    };
    return colors[val] || 'bg-gray-900';
  };

  const getTextColor = (val: number): string => {
    return val > 4 ? 'text-white' : 'text-gray-700';
  };

  return (
          <>
              <Head title="Welcome">
                  <link rel="preconnect" href="https://fonts.bunny.net" />
                  <link
                      href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                      rel="stylesheet"
                  />
              </Head>
              <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                  <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">                    
                      <nav className="flex items-center justify-end gap-4">
                          {auth.user ? (
                              <Link
                                  href={dashboard()}
                                  className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                              >
                                  Dashboard
                              </Link>
                          ) : (
                              <>
                                  <Link
                                      href={login()}
                                      className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                  >
                                      Log in
                                  </Link>
                                  <Link
                                      href={register()}
                                      className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                  >
                                      Register
                                  </Link>
                              </>
                          )}
                      </nav>
                  </header>
                  <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                      <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                          <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                              
                              <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
                                <div className="max-w-lg w-full">
                                    <div className="text-center mb-8">
                                    <h1 className="text-6xl font-bold text-orange-600 mb-2">2048</h1>
                                    <p className="text-gray-600">Use arrow keys to play</p>
                                    </div>

                                    <div className="flex justify-between mb-4">
                                    <div className="bg-orange-400 text-white px-6 py-3 rounded-lg">
                                        <div className="text-sm font-semibold">SCORE</div>
                                        <div className="text-2xl font-bold">{score}</div>
                                    </div>
                                    <div className="bg-orange-400 text-white px-6 py-3 rounded-lg">
                                        <div className="text-sm font-semibold">BEST</div>
                                        <div className="text-2xl font-bold">{bestScore}</div>
                                    </div>
                                    <button
                                        onClick={resetGame}
                                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition"
                                    >
                                        New Game
                                    </button>
                                    </div>

                                    <div className="relative">
                                    <div className="bg-orange-300 p-4 rounded-xl shadow-lg">
                                        <div className="grid grid-cols-4 gap-3">
                                        {board.map((row, r) =>
                                            row.map((val, c) => (
                                            <div
                                                key={`${r}-${c}`}
                                                className={`aspect-square rounded-lg flex items-center justify-center text-3xl font-bold transition-all duration-150 ${getTileColor(val)} ${getTextColor(val)} shadow`}
                                            >
                                                {val !== 0 && val}
                                            </div>
                                            ))
                                        )}
                                        </div>
                                    </div>

                                    {(gameOver || won) && (
                                        <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
                                        <div className="text-center">
                                            <div className={`text-5xl font-bold mb-4 ${won ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {won ? 'You Win!' : 'Game Over!'}
                                            </div>
                                            <button
                                            onClick={resetGame}
                                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-bold text-xl transition"
                                            >
                                            Try Again
                                            </button>
                                        </div>
                                        </div>
                                    )}
                                    </div>

                                    <div className="mt-6 text-center text-gray-600 text-sm">
                                    <p className="font-semibold mb-2">How to play:</p>
                                    <p>Use arrow keys to move tiles. When two tiles with the same number touch, they merge into one!</p>
                                    </div>
                                </div>
                                </div>
                              
  
                          </div>
                      </main>
                  </div>
                  <div className="hidden h-14.5 lg:block"></div>
              </div>
          </>
      );
}
