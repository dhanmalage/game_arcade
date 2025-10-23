import React, { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shuffle, RotateCcw, Trophy, Timer, Target } from 'lucide-react';

interface Game {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    view_name: string;
}

interface PuzzleMasterProps {
    game: Game;
}

type PuzzleSize = 3 | 4;
type Tile = number | null;
type Board = Tile[][];

const PuzzleMaster: React.FC<PuzzleMasterProps> = ({ game }) => {
    const [size, setSize] = useState<PuzzleSize>(3);
    const [board, setBoard] = useState<Board>([]);
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [bestScore, setBestScore] = useState<{ moves: number; time: number } | null>(null);

    // Initialize board
    const initializeBoard = useCallback((puzzleSize: PuzzleSize) => {
        const totalTiles = puzzleSize * puzzleSize;
        const tiles: number[] = [];

        for (let i = 1; i < totalTiles; i++) {
            tiles.push(i);
        }

        // Create 2D array
        const newBoard: Board = [];
        for (let i = 0; i < puzzleSize; i++) {
            const row: Tile[] = [];
            for (let j = 0; j < puzzleSize; j++) {
                const index = i * puzzleSize + j;
                row.push(index < tiles.length ? tiles[index] : null);
            }
            newBoard.push(row);
        }

        return newBoard;
    }, []);

    // Shuffle board
    const shuffleBoard = useCallback(() => {
        const newBoard = initializeBoard(size);

        // Perform random valid moves to ensure solvability
        let currentBoard = [...newBoard.map(row => [...row])];
        const shuffleMoves = size === 3 ? 100 : 200;

        for (let i = 0; i < shuffleMoves; i++) {
            const emptyPos = findEmptyPosition(currentBoard);
            const validMoves = getValidMoves(currentBoard, emptyPos);

            if (validMoves.length > 0) {
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                currentBoard = makeMove(currentBoard, randomMove.row, randomMove.col);
            }
        }

        setBoard(currentBoard);
        setMoves(0);
        setTime(0);
        setIsComplete(false);
        setIsPlaying(true);
    }, [size, initializeBoard]);

    // Find empty position
    const findEmptyPosition = (currentBoard: Board) => {
        for (let i = 0; i < currentBoard.length; i++) {
            for (let j = 0; j < currentBoard[i].length; j++) {
                if (currentBoard[i][j] === null) {
                    return { row: i, col: j };
                }
            }
        }
        return { row: 0, col: 0 };
    };

    // Get valid moves
    const getValidMoves = (currentBoard: Board, emptyPos: { row: number; col: number }) => {
        const moves = [];
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }, // left
            { row: 0, col: 1 }   // right
        ];

        for (const dir of directions) {
            const newRow = emptyPos.row + dir.row;
            const newCol = emptyPos.col + dir.col;

            if (newRow >= 0 && newRow < currentBoard.length &&
                newCol >= 0 && newCol < currentBoard[0].length) {
                moves.push({ row: newRow, col: newCol });
            }
        }

        return moves;
    };

    // Make a move
    const makeMove = (currentBoard: Board, row: number, col: number): Board => {
        const emptyPos = findEmptyPosition(currentBoard);
        const isValidMove = Math.abs(emptyPos.row - row) + Math.abs(emptyPos.col - col) === 1;

        if (!isValidMove) return currentBoard;

        const newBoard = currentBoard.map(r => [...r]);
        newBoard[emptyPos.row][emptyPos.col] = newBoard[row][col];
        newBoard[row][col] = null;

        return newBoard;
    };

    // Handle tile click
    const handleTileClick = (row: number, col: number) => {
        if (!isPlaying || isComplete) return;

        const newBoard = makeMove(board, row, col);
        if (newBoard !== board) {
            setBoard(newBoard);
            setMoves(prev => prev + 1);
        }
    };

    // Check if puzzle is complete
    const checkComplete = useCallback((currentBoard: Board) => {
        let expectedValue = 1;

        for (let i = 0; i < currentBoard.length; i++) {
            for (let j = 0; j < currentBoard[i].length; j++) {
                if (i === currentBoard.length - 1 && j === currentBoard[i].length - 1) {
                    return currentBoard[i][j] === null;
                }
                if (currentBoard[i][j] !== expectedValue) {
                    return false;
                }
                expectedValue++;
            }
        }

        return true;
    }, []);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && !isComplete) {
            interval = setInterval(() => {
                setTime(prev => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isPlaying, isComplete]);

    // Check completion effect
    useEffect(() => {
        if (board.length > 0 && checkComplete(board)) {
            setIsComplete(true);
            setIsPlaying(false);

            // Update best score
            const currentScore = { moves, time };
            if (!bestScore || moves < bestScore.moves || (moves === bestScore.moves && time < bestScore.time)) {
                setBestScore(currentScore);
                localStorage.setItem('puzzleMasterBest', JSON.stringify(currentScore));
            }
        }
    }, [board, checkComplete, moves, time, bestScore]);

    // Load best score on mount
    useEffect(() => {
        const saved = localStorage.getItem('puzzleMasterBest');
        if (saved) {
            setBestScore(JSON.parse(saved));
        }
    }, []);

    // Initialize board on size change
    useEffect(() => {
        const initialBoard = initializeBoard(size);
        setBoard(initialBoard);
        setMoves(0);
        setTime(0);
        setIsPlaying(false);
        setIsComplete(false);
    }, [size, initializeBoard]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Head title={game.title} />

            <AppLayout className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">{game.title}</h1>
                        <p className="text-gray-600">{game.description}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Game Board */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>Puzzle Board</CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSize(3)}
                                                className={size === 3 ? 'bg-blue-100' : ''}
                                            >
                                                3x3
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSize(4)}
                                                className={size === 4 ? 'bg-blue-100' : ''}
                                            >
                                                4x4
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-center mb-4">
                                        <div
                                            className="grid gap-2 p-4 bg-gray-100 rounded-lg"
                                            style={{
                                                gridTemplateColumns: `repeat(${size}, 1fr)`,
                                                width: 'fit-content'
                                            }}
                                        >
                                            {board.map((row, rowIndex) =>
                                                row.map((tile, colIndex) => (
                                                    <div
                                                        key={`${rowIndex}-${colIndex}`}
                                                        className={`
                              w-16 h-16 flex items-center justify-center text-xl font-bold rounded-lg cursor-pointer transition-all
                              ${tile === null
                                                                ? 'bg-transparent'
                                                                : 'bg-white hover:bg-blue-50 shadow-md hover:shadow-lg'
                                                            }
                            `}
                                                        onClick={() => handleTileClick(rowIndex, colIndex)}
                                                    >
                                                        {tile}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <Button onClick={shuffleBoard} className="flex items-center gap-2">
                                            <Shuffle className="w-4 h-4" />
                                            New Game
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const initialBoard = initializeBoard(size);
                                                setBoard(initialBoard);
                                                setMoves(0);
                                                setTime(0);
                                                setIsPlaying(false);
                                                setIsComplete(false);
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Reset
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Panel */}
                        <div className="space-y-4">
                            {/* Current Game Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="w-5 h-5" />
                                        Current Game
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Timer className="w-4 h-4" />
                                            Time
                                        </span>
                                        <Badge variant="secondary">{formatTime(time)}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span>Moves</span>
                                        <Badge variant="secondary">{moves}</Badge>
                                    </div>

                                    {isComplete && (
                                        <div className="text-center p-4 bg-green-50 rounded-lg">
                                            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                            <p className="font-semibold text-green-800">Puzzle Complete!</p>
                                            <p className="text-sm text-green-600">
                                                {moves} moves in {formatTime(time)}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Best Score */}
                            {bestScore && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                            Best Score
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span>Time</span>
                                            <Badge variant="outline">{formatTime(bestScore.time)}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>Moves</span>
                                            <Badge variant="outline">{bestScore.moves}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Instructions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>How to Play</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-600 space-y-2">
                                    <p>• Click on tiles adjacent to the empty space to move them</p>
                                    <p>• Arrange numbers in order from 1 to {size * size - 1}</p>
                                    <p>• The empty space should be in the bottom-right corner</p>
                                    <p>• Try to complete the puzzle in the fewest moves!</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
};

export default PuzzleMaster;