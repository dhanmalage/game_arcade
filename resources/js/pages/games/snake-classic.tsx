import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Direction {
  x: -1 | 0 | 1;
  y: -1 | 0 | 1;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{x: 10, y: 10}];
const INITIAL_DIRECTION: Direction = {x: 1, y: 0};
const INITIAL_SPEED = 200;
const MIN_SPEED = 50;

export default function SnakeGame() {
    const { auth } = usePage<SharedData>().props;

    const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({x: 15, y: 15});
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED);
  const directionRef = useRef(INITIAL_DIRECTION);

  const generateFood = (currentSnake: Point[] = snake): Point => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameSpeed(INITIAL_SPEED);
  };

  const handleMouseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameOver || isPaused) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const head = snake[0];
    const headPixelX = head.x * CELL_SIZE + CELL_SIZE / 2;
    const headPixelY = head.y * CELL_SIZE + CELL_SIZE / 2;
    
    const deltaX = clickX - headPixelX;
    const deltaY = clickY - headPixelY;
    
    let newDir = {...directionRef.current};
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && directionRef.current.x !== -1) {
        newDir = {x: 1, y: 0};
      } else if (deltaX < 0 && directionRef.current.x !== 1) {
        newDir = {x: -1, y: 0};
      }
    } else {
      if (deltaY > 0 && directionRef.current.y !== -1) {
        newDir = {x: 0, y: 1};
      } else if (deltaY < 0 && directionRef.current.y !== 1) {
        newDir = {x: 0, y: -1};
      }
    }
    
    setDirection(newDir);
    directionRef.current = newDir;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      
      let newDir = {...directionRef.current};
      
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (directionRef.current.y !== 1) newDir = {x: 0, y: -1};
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (directionRef.current.y !== -1) newDir = {x: 0, y: 1};
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (directionRef.current.x !== 1) newDir = {x: -1, y: 0};
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (directionRef.current.x !== -1) newDir = {x: 1, y: 0};
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
        default:
          return;
      }
      
      setDirection(newDir);
      directionRef.current = newDir;
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    let intervalId: NodeJS.Timeout;
    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: (head.x + directionRef.current.x + GRID_SIZE) % GRID_SIZE,
          y: (head.y + directionRef.current.y + GRID_SIZE) % GRID_SIZE
        };

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check if food eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(generateFood());
          setScore(s => {
            const newScore = s + 10;
            // Speed up every 30 points
            const newSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - Math.floor(newScore / 30) * 15);
            setGameSpeed(newSpeed);
            return newScore;
          });
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    };

    intervalId = setInterval(moveSnake, gameSpeed);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gameOver, food, isPaused, gameSpeed]);

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
                            
                            
                            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-emerald-950 p-8">
                                <div className="mb-6 text-center">
                                    <h1 className="text-5xl font-bold text-green-300 mb-2">🐍 Snake Game</h1>
                                    <p className="text-green-200 text-lg">Score: {score}</p>
                                </div>

                                <div 
                                    className="relative border-4 border-green-400 rounded-lg shadow-2xl cursor-pointer"
                                    style={{
                                    width: GRID_SIZE * CELL_SIZE,
                                    height: GRID_SIZE * CELL_SIZE,
                                    backgroundColor: '#0a1f0a'
                                    }}
                                    onClick={handleMouseClick}
                                >
                                    {/* Food */}
                                    <div
                                    className="absolute bg-red-500 rounded-full"
                                    style={{
                                        width: CELL_SIZE - 2,
                                        height: CELL_SIZE - 2,
                                        left: food.x * CELL_SIZE + 1,
                                        top: food.y * CELL_SIZE + 1
                                    }}
                                    />

                                    {/* Snake */}
                                    {snake.map((segment, i) => (
                                    <div
                                        key={i}
                                        className="absolute rounded"
                                        style={{
                                        width: CELL_SIZE - 2,
                                        height: CELL_SIZE - 2,
                                        left: segment.x * CELL_SIZE + 1,
                                        top: segment.y * CELL_SIZE + 1,
                                        backgroundColor: i === 0 ? '#22c55e' : '#16a34a'
                                        }}
                                    />
                                    ))}

                                    {/* Game Over Overlay */}
                                    {gameOver && (
                                    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                                        <div className="text-center">
                                        <p className="text-4xl font-bold text-red-500 mb-4">Game Over!</p>
                                        <p className="text-2xl text-white mb-6">Score: {score}</p>
                                        <button
                                            onClick={resetGame}
                                            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg transition"
                                        >
                                            Play Again
                                        </button>
                                        </div>
                                    </div>
                                    )}

                                    {/* Pause Overlay */}
                                    {isPaused && !gameOver && (
                                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                        <p className="text-4xl font-bold text-green-300">Paused</p>
                                    </div>
                                    )}
                                </div>

                                <div className="mt-6 text-center text-green-200">
                                    <p className="mb-2">
                                    <span className="font-semibold">Keyboard:</span> Arrow keys or WASD
                                    </p>
                                    <p className="mb-2">
                                    <span className="font-semibold">Mouse:</span> Click to change direction
                                    </p>
                                    <p>
                                    <span className="font-semibold">Spacebar:</span> Pause
                                    </p>
                                </div>

                                {gameOver && (
                                    <button
                                    onClick={resetGame}
                                    className="mt-4 px-8 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xl transition shadow-lg"
                                    >
                                    Restart Game
                                    </button>
                                )}
                                </div>

                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
