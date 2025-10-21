import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Trophy, Zap, Timer, Flag, Car, Settings } from 'lucide-react';

interface Game {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    view_name: string;
}

interface RacingThunderProps {
    game: Game;
}

interface Car {
    x: number;
    y: number;
    angle: number;
    speed: number;
    maxSpeed: number;
    acceleration: number;
    friction: number;
    width: number;
    height: number;
}

interface Track {
    name: string;
    color: string;
    difficulty: number;
    laps: number;
    checkpoints: { x: number; y: number }[];
}

interface GameState {
    car: Car;
    currentTrack: number;
    currentLap: number;
    currentCheckpoint: number;
    raceTime: number;
    bestTime: number;
    isPlaying: boolean;
    isPaused: boolean;
    raceFinished: boolean;
    speed: number; // Current speed for display
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CAR_SIZE = 20;

const tracks: Track[] = [
    {
        name: "Thunder Circuit",
        color: "#ff6b35",
        difficulty: 1,
        laps: 3,
        checkpoints: [
            { x: 400, y: 500 }, // Start/Finish
            { x: 650, y: 400 },
            { x: 700, y: 200 },
            { x: 500, y: 100 },
            { x: 200, y: 150 },
            { x: 100, y: 350 },
            { x: 250, y: 450 }
        ]
    },
    {
        name: "Lightning Loop",
        color: "#4a90e2",
        difficulty: 2,
        laps: 2,
        checkpoints: [
            { x: 400, y: 500 },
            { x: 600, y: 450 },
            { x: 650, y: 300 },
            { x: 550, y: 150 },
            { x: 350, y: 100 },
            { x: 150, y: 200 },
            { x: 100, y: 400 },
            { x: 200, y: 500 }
        ]
    },
    {
        name: "Storm Valley",
        color: "#9013fe",
        difficulty: 3,
        laps: 4,
        checkpoints: [
            { x: 400, y: 500 },
            { x: 700, y: 480 },
            { x: 750, y: 300 },
            { x: 650, y: 100 },
            { x: 400, y: 50 },
            { x: 150, y: 100 },
            { x: 50, y: 300 },
            { x: 100, y: 500 },
            { x: 250, y: 520 }
        ]
    }
];

const RacingThunder: React.FC<RacingThunderProps> = ({ game }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const keysRef = useRef(new Set<string>());

    const [gameState, setGameState] = useState<GameState>({
        car: {
            x: 400,
            y: 500,
            angle: 0,
            speed: 0,
            maxSpeed: 8,
            acceleration: 0.3,
            friction: 0.95,
            width: CAR_SIZE,
            height: CAR_SIZE
        },
        currentTrack: 0,
        currentLap: 1,
        currentCheckpoint: 0,
        raceTime: 0,
        bestTime: 0,
        isPlaying: false,
        isPaused: false,
        raceFinished: false,
        speed: 0
    });

    const [selectedTrack, setSelectedTrack] = useState(0);
    const [showTrackSelect, setShowTrackSelect] = useState(false);

    // Initialize game
    const initializeGame = useCallback(() => {
        const track = tracks[selectedTrack];
        const startPoint = track.checkpoints[0];

        setGameState({
            car: {
                x: startPoint.x,
                y: startPoint.y,
                angle: 0,
                speed: 0,
                maxSpeed: 8,
                acceleration: 0.3,
                friction: 0.95,
                width: CAR_SIZE,
                height: CAR_SIZE
            },
            currentTrack: selectedTrack,
            currentLap: 1,
            currentCheckpoint: 0,
            raceTime: 0,
            bestTime: gameState.bestTime,
            isPlaying: false,
            isPaused: false,
            raceFinished: false,
            speed: 0
        });
    }, [selectedTrack, gameState.bestTime]);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            keysRef.current.add(e.key.toLowerCase());
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keysRef.current.delete(e.key.toLowerCase());
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Check checkpoint collision
    const checkCheckpointCollision = (car: Car, checkpoint: { x: number; y: number }): boolean => {
        const distance = Math.sqrt(
            Math.pow(car.x - checkpoint.x, 2) + Math.pow(car.y - checkpoint.y, 2)
        );
        return distance < 40;
    };

    // Update game state
    const updateGame = useCallback(() => {
        if (!gameState.isPlaying || gameState.isPaused || gameState.raceFinished) return;

        setGameState(prevState => {
            const newState = { ...prevState };
            const car = { ...newState.car };
            const track = tracks[newState.currentTrack];

            // Handle input
            let accelerating = false;
            if (keysRef.current.has('arrowup') || keysRef.current.has('w')) {
                car.speed = Math.min(car.maxSpeed, car.speed + car.acceleration);
                accelerating = true;
            }
            if (keysRef.current.has('arrowdown') || keysRef.current.has('s')) {
                car.speed = Math.max(-car.maxSpeed * 0.5, car.speed - car.acceleration);
                accelerating = true;
            }
            if (keysRef.current.has('arrowleft') || keysRef.current.has('a')) {
                if (Math.abs(car.speed) > 0.5) {
                    car.angle -= 0.05 * Math.abs(car.speed);
                }
            }
            if (keysRef.current.has('arrowright') || keysRef.current.has('d')) {
                if (Math.abs(car.speed) > 0.5) {
                    car.angle += 0.05 * Math.abs(car.speed);
                }
            }

            // Apply friction
            if (!accelerating) {
                car.speed *= car.friction;
                if (Math.abs(car.speed) < 0.1) car.speed = 0;
            }

            // Update position
            car.x += Math.cos(car.angle) * car.speed;
            car.y += Math.sin(car.angle) * car.speed;

            // Keep car within bounds
            car.x = Math.max(car.width / 2, Math.min(CANVAS_WIDTH - car.width / 2, car.x));
            car.y = Math.max(car.height / 2, Math.min(CANVAS_HEIGHT - car.height / 2, car.y));

            // Check checkpoint collision
            const nextCheckpoint = (newState.currentCheckpoint + 1) % track.checkpoints.length;
            const checkpoint = track.checkpoints[nextCheckpoint];

            if (checkCheckpointCollision(car, checkpoint)) {
                newState.currentCheckpoint = nextCheckpoint;

                // Check if completed a lap
                if (nextCheckpoint === 0 && newState.currentCheckpoint !== 0) {
                    newState.currentLap++;

                    // Check if race finished
                    if (newState.currentLap > track.laps) {
                        newState.raceFinished = true;
                        newState.isPlaying = false;

                        // Update best time
                        if (newState.bestTime === 0 || newState.raceTime < newState.bestTime) {
                            newState.bestTime = newState.raceTime;
                            localStorage.setItem(`racingThunderBest_${newState.currentTrack}`, newState.raceTime.toString());
                        }
                    }
                }
            }

            // Update race time
            newState.raceTime += 1 / 60; // Assuming 60 FPS
            newState.speed = Math.abs(car.speed) * 10; // Convert to display speed
            newState.car = car;

            return newState;
        });
    }, [gameState.isPlaying, gameState.isPaused, gameState.raceFinished]);

    // Render game
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const track = tracks[gameState.currentTrack];

        // Clear canvas with gradient background
        const gradient = ctx.createRadialGradient(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw track (checkpoints and path)
        ctx.strokeStyle = track.color;
        ctx.lineWidth = 8;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();

        for (let i = 0; i < track.checkpoints.length; i++) {
            const current = track.checkpoints[i];
            const next = track.checkpoints[(i + 1) % track.checkpoints.length];

            if (i === 0) {
                ctx.moveTo(current.x, current.y);
            }
            ctx.lineTo(next.x, next.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw checkpoints
        track.checkpoints.forEach((checkpoint, index) => {
            const isNext = index === (gameState.currentCheckpoint + 1) % track.checkpoints.length;
            const isStart = index === 0;

            // Checkpoint circle
            ctx.beginPath();
            ctx.arc(checkpoint.x, checkpoint.y, 25, 0, 2 * Math.PI);

            if (isStart) {
                ctx.fillStyle = '#00ff00';
                ctx.strokeStyle = '#ffffff';
            } else if (isNext) {
                ctx.fillStyle = '#ffff00';
                ctx.strokeStyle = '#ffffff';
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            }

            ctx.fill();
            ctx.lineWidth = 2;
            ctx.stroke();

            // Checkpoint number
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText((index + 1).toString(), checkpoint.x, checkpoint.y + 5);
        });

        // Draw car
        ctx.save();
        ctx.translate(gameState.car.x, gameState.car.y);
        ctx.rotate(gameState.car.angle);

        // Car body
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-gameState.car.width / 2, -gameState.car.height / 2, gameState.car.width, gameState.car.height);

        // Car details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-gameState.car.width / 2 + 2, -gameState.car.height / 2 + 2, gameState.car.width - 4, 4);
        ctx.fillRect(-gameState.car.width / 2 + 2, gameState.car.height / 2 - 6, gameState.car.width - 4, 4);

        // Car front
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(gameState.car.width / 2 - 3, -3, 6, 6);

        ctx.restore();

        // Draw speed lines effect when moving fast
        if (gameState.speed > 50) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = 100 + Math.random() * 200;
                const x1 = gameState.car.x + Math.cos(angle) * distance;
                const y1 = gameState.car.y + Math.sin(angle) * distance;
                const x2 = x1 + Math.cos(angle) * 20;
                const y2 = y1 + Math.sin(angle) * 20;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }

        // Draw finish screen
        if (gameState.raceFinished) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('RACE FINISHED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

            ctx.font = '24px Arial';
            ctx.fillText(`Time: ${formatTime(gameState.raceTime)}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

            if (gameState.raceTime === gameState.bestTime) {
                ctx.fillStyle = '#ffff00';
                ctx.fillText('NEW BEST TIME!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
            }
        }
    }, [gameState]);

    // Game loop
    useEffect(() => {
        const gameLoop = () => {
            updateGame();
            render();
            animationRef.current = requestAnimationFrame(gameLoop);
        };

        if (gameState.isPlaying && !gameState.isPaused) {
            animationRef.current = requestAnimationFrame(gameLoop);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [updateGame, render, gameState.isPlaying, gameState.isPaused]);

    // Load best times on mount
    useEffect(() => {
        const saved = localStorage.getItem(`racingThunderBest_${gameState.currentTrack}`);
        if (saved) {
            setGameState(prev => ({ ...prev, bestTime: parseFloat(saved) }));
        }
    }, [gameState.currentTrack]);

    // Initialize game when track changes
    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(2);
        return `${mins}:${secs.padStart(5, '0')}`;
    };

    const startRace = () => {
        setGameState(prev => ({ ...prev, isPlaying: true, raceFinished: false, raceTime: 0 }));
        setShowTrackSelect(false);
    };

    const pauseRace = () => {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    };

    const resetRace = () => {
        initializeGame();
    };

    const selectTrack = (trackIndex: number) => {
        setSelectedTrack(trackIndex);
        setShowTrackSelect(false);
    };

    return (
        <>
            <Head title={game.title} />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4">
                            {game.title}
                        </h1>
                        <p className="text-xl text-gray-300">{game.description}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Game Canvas */}
                        <div className="lg:col-span-3">
                            <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Car className="w-6 h-6 text-red-500" />
                                            {tracks[gameState.currentTrack].name}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => setShowTrackSelect(!showTrackSelect)}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Track
                                            </Button>
                                            {!gameState.isPlaying ? (
                                                <Button onClick={startRace} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                                                    <Play className="w-4 h-4" />
                                                    Start Race
                                                </Button>
                                            ) : (
                                                <Button onClick={pauseRace} variant="outline" className="flex items-center gap-2">
                                                    <Pause className="w-4 h-4" />
                                                    {gameState.isPaused ? 'Resume' : 'Pause'}
                                                </Button>
                                            )}
                                            <Button onClick={resetRace} variant="outline" className="flex items-center gap-2">
                                                <RotateCcw className="w-4 h-4" />
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Track Selection */}
                                    {showTrackSelect && (
                                        <div className="mb-4 p-4 bg-gray-700/50 rounded-lg">
                                            <h3 className="text-white font-semibold mb-3">Select Track:</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                {tracks.map((track, index) => (
                                                    <Button
                                                        key={index}
                                                        onClick={() => selectTrack(index)}
                                                        variant={selectedTrack === index ? "default" : "outline"}
                                                        className="flex flex-col items-center p-4 h-auto"
                                                        style={{
                                                            backgroundColor: selectedTrack === index ? track.color : 'transparent',
                                                            borderColor: track.color
                                                        }}
                                                    >
                                                        <div className="font-semibold">{track.name}</div>
                                                        <div className="text-xs opacity-75">
                                                            {track.laps} laps • Difficulty: {track.difficulty}/3
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-center">
                                        <canvas
                                            ref={canvasRef}
                                            width={CANVAS_WIDTH}
                                            height={CANVAS_HEIGHT}
                                            className="border-2 border-gray-600 rounded-lg bg-gradient-to-br from-gray-900 to-blue-900 shadow-2xl"
                                            tabIndex={0}
                                        />
                                    </div>

                                    <div className="mt-4 text-center text-gray-300 text-sm">
                                        <p className="mb-2">🏎️ Use WASD or Arrow Keys to control your car</p>
                                        <div className="flex justify-center gap-6 text-xs">
                                            <span>🟢 Start/Finish</span>
                                            <span>🟡 Next Checkpoint</span>
                                            <span>⚪ Checkpoints</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Panel */}
                        <div className="space-y-4">
                            {/* Race Status */}
                            <Card className="bg-gradient-to-br from-red-900/90 to-orange-900/90 border-red-700 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Flag className="w-5 h-5 text-yellow-400" />
                                        Race Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-200">Lap</span>
                                        <Badge variant="secondary" className="bg-yellow-600 text-white">
                                            {gameState.currentLap}/{tracks[gameState.currentTrack].laps}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-200">Checkpoint</span>
                                        <Badge variant="secondary" className="bg-blue-600 text-white">
                                            {gameState.currentCheckpoint + 1}/{tracks[gameState.currentTrack].checkpoints.length}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-gray-200">
                                            <Timer className="w-4 h-4 text-green-400" />
                                            Time
                                        </span>
                                        <Badge variant="outline" className="text-green-400 border-green-400">
                                            {formatTime(gameState.raceTime)}
                                        </Badge>
                                    </div>

                                    {gameState.raceFinished && (
                                        <div className="text-center p-4 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg border border-yellow-500/50">
                                            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                            <p className="font-semibold text-yellow-300">Race Complete!</p>
                                            <p className="text-sm text-yellow-400">
                                                Final Time: {formatTime(gameState.raceTime)}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Performance */}
                            <Card className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 border-blue-700 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-200">Speed</span>
                                            <span className="text-white font-mono">{Math.round(gameState.speed)} mph</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full transition-all duration-200"
                                                style={{ width: `${Math.min(100, (gameState.speed / 80) * 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {gameState.bestTime > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-200">Best Time</span>
                                            <Badge variant="outline" className="text-purple-400 border-purple-400">
                                                {formatTime(gameState.bestTime)}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Track Info */}
                            <Card className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-purple-700 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white">Track Info</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-200 space-y-2">
                                    <div className="flex justify-between">
                                        <span>Track:</span>
                                        <span className="font-semibold" style={{ color: tracks[gameState.currentTrack].color }}>
                                            {tracks[gameState.currentTrack].name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Difficulty:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3].map(i => (
                                                <div
                                                    key={i}
                                                    className={`w-3 h-3 rounded-full ${i <= tracks[gameState.currentTrack].difficulty
                                                        ? 'bg-red-500'
                                                        : 'bg-gray-600'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Total Laps:</span>
                                        <span>{tracks[gameState.currentTrack].laps}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Checkpoints:</span>
                                        <span>{tracks[gameState.currentTrack].checkpoints.length}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Controls */}
                            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white">Controls</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-300 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>W/↑ - Accelerate</div>
                                        <div>S/↓ - Brake/Reverse</div>
                                        <div>A/← - Turn Left</div>
                                        <div>D/→ - Turn Right</div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-600">
                                        <p className="text-xs text-gray-400">
                                            Navigate through all checkpoints in order to complete each lap.
                                            Finish all laps to win the race!
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RacingThunder;