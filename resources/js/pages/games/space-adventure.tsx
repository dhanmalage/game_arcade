import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Trophy, Fuel, Zap, Heart, Rocket } from 'lucide-react';

interface Game {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    view_name: string;
}

interface SpaceAdventureProps {
    game: Game;
}

interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'player' | 'asteroid' | 'fuel' | 'enemy' | 'powerup';
    speed?: number;
    health?: number;
}

interface GameState {
    player: GameObject;
    objects: GameObject[];
    score: number;
    fuel: number;
    health: number;
    level: number;
    isPlaying: boolean;
    isPaused: boolean;
    gameOver: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 5;
const OBJECT_SPAWN_RATE = 0.02;

const SpaceAdventure: React.FC<SpaceAdventureProps> = ({ game }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);
    const keysRef = useRef(new Set<string>());

    const [gameState, setGameState] = useState<GameState>({
        player: {
            x: CANVAS_WIDTH / 2 - 25,
            y: CANVAS_HEIGHT - 80,
            width: 50,
            height: 50,
            type: 'player'
        },
        objects: [],
        score: 0,
        fuel: 100,
        health: 100,
        level: 1,
        isPlaying: false,
        isPaused: false,
        gameOver: false
    });

    const [bestScore, setBestScore] = useState<number>(0);

    // Initialize game
    const initializeGame = useCallback(() => {
        setGameState({
            player: {
                x: CANVAS_WIDTH / 2 - 25,
                y: CANVAS_HEIGHT - 80,
                width: 50,
                height: 50,
                type: 'player'
            },
            objects: [],
            score: 0,
            fuel: 100,
            health: 100,
            level: 1,
            isPlaying: false,
            isPaused: false,
            gameOver: false
        });
    }, []);

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

    // Collision detection
    const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
        return obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y;
    };

    // Spawn objects
    const spawnObject = (currentLevel: number): GameObject | null => {
        if (Math.random() > OBJECT_SPAWN_RATE) return null;

        const objectTypes = ['asteroid', 'fuel', 'enemy', 'powerup'];
        const weights = [0.5, 0.25, 0.15, 0.1]; // Probability weights

        let random = Math.random();
        let selectedType = 'asteroid';

        for (let i = 0; i < objectTypes.length; i++) {
            if (random < weights[i]) {
                selectedType = objectTypes[i];
                break;
            }
            random -= weights[i];
        }

        const baseSpeed = 2 + Math.floor(currentLevel / 3);

        return {
            x: Math.random() * (CANVAS_WIDTH - 40),
            y: -40,
            width: selectedType === 'fuel' || selectedType === 'powerup' ? 30 : 40,
            height: selectedType === 'fuel' || selectedType === 'powerup' ? 30 : 40,
            type: selectedType as GameObject['type'],
            speed: baseSpeed + Math.random() * 2
        };
    };

    // Update game state
    const updateGame = useCallback(() => {
        if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) return;

        setGameState(prevState => {
            const newState = { ...prevState };

            // Update player position based on keys
            if (keysRef.current.has('arrowleft') || keysRef.current.has('a')) {
                newState.player.x = Math.max(0, newState.player.x - PLAYER_SPEED);
            }
            if (keysRef.current.has('arrowright') || keysRef.current.has('d')) {
                newState.player.x = Math.min(CANVAS_WIDTH - newState.player.width, newState.player.x + PLAYER_SPEED);
            }
            if (keysRef.current.has('arrowup') || keysRef.current.has('w')) {
                newState.player.y = Math.max(0, newState.player.y - PLAYER_SPEED);
            }
            if (keysRef.current.has('arrowdown') || keysRef.current.has('s')) {
                newState.player.y = Math.min(CANVAS_HEIGHT - newState.player.height, newState.player.y + PLAYER_SPEED);
            }

            // Spawn new objects
            const newObject = spawnObject(newState.level);
            if (newObject) {
                newState.objects.push(newObject);
            }

            // Update objects
            newState.objects = newState.objects.filter(obj => {
                obj.y += obj.speed || 2;
                return obj.y < CANVAS_HEIGHT + 50;
            });

            // Check collisions
            newState.objects = newState.objects.filter(obj => {
                if (checkCollision(newState.player, obj)) {
                    switch (obj.type) {
                        case 'asteroid':
                            newState.health -= 20;
                            break;
                        case 'enemy':
                            newState.health -= 30;
                            break;
                        case 'fuel':
                            newState.fuel = Math.min(100, newState.fuel + 25);
                            newState.score += 50;
                            break;
                        case 'powerup':
                            newState.health = Math.min(100, newState.health + 20);
                            newState.score += 100;
                            break;
                    }
                    return obj.type === 'asteroid' || obj.type === 'enemy'; // Remove fuel and powerups
                }
                return true;
            });

            // Update fuel consumption
            newState.fuel = Math.max(0, newState.fuel - 0.1);

            // Update score and level
            newState.score += 1;
            newState.level = Math.floor(newState.score / 1000) + 1;

            // Check game over conditions
            if (newState.health <= 0 || newState.fuel <= 0) {
                newState.gameOver = true;
                newState.isPlaying = false;

                // Update best score
                if (newState.score > bestScore) {
                    setBestScore(newState.score);
                    localStorage.setItem('spaceAdventureBest', newState.score.toString());
                }
            }

            return newState;
        });
    }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver, bestScore]);

    // Render game
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas with space background
        const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        gradient.addColorStop(0, '#000011');
        gradient.addColorStop(1, '#000033');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 123) % CANVAS_WIDTH;
            const y = (i * 456 + Date.now() * 0.1) % CANVAS_HEIGHT;
            ctx.fillRect(x, y, 1, 1);
        }

        // Draw player (spaceship)
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

        // Draw player details
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(gameState.player.x + 20, gameState.player.y + 10, 10, 30);

        // Draw objects
        gameState.objects.forEach(obj => {
            switch (obj.type) {
                case 'asteroid':
                    ctx.fillStyle = '#8B4513';
                    break;
                case 'fuel':
                    ctx.fillStyle = '#FFD700';
                    break;
                case 'enemy':
                    ctx.fillStyle = '#FF0000';
                    break;
                case 'powerup':
                    ctx.fillStyle = '#00FFFF';
                    break;
            }
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);

            // Add some details to objects
            if (obj.type === 'fuel') {
                ctx.fillStyle = '#FFA500';
                ctx.fillRect(obj.x + 5, obj.y + 5, obj.width - 10, obj.height - 10);
            } else if (obj.type === 'enemy') {
                ctx.fillStyle = '#800000';
                ctx.fillRect(obj.x + 5, obj.y + 5, obj.width - 10, obj.height - 10);
            }
        });

        // Draw game over screen
        if (gameState.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.fillStyle = '#ffffff';
            ctx.font = '48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

            ctx.font = '24px Arial';
            ctx.fillText(`Final Score: ${gameState.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.fillText(`Level Reached: ${gameState.level}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
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

    // Load best score on mount
    useEffect(() => {
        const saved = localStorage.getItem('spaceAdventureBest');
        if (saved) {
            setBestScore(parseInt(saved));
        }
    }, []);

    const startGame = () => {
        setGameState(prev => ({ ...prev, isPlaying: true, gameOver: false }));
    };

    const pauseGame = () => {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    };

    const resetGame = () => {
        initializeGame();
    };

    return (
        <>
            <Head title={game.title} />

            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">{game.title}</h1>
                        <p className="text-gray-300">{game.description}</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Game Canvas */}
                        <div className="lg:col-span-3">
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-white">Space Explorer</CardTitle>
                                        <div className="flex gap-2">
                                            {!gameState.isPlaying ? (
                                                <Button onClick={startGame} className="flex items-center gap-2">
                                                    <Play className="w-4 h-4" />
                                                    Start
                                                </Button>
                                            ) : (
                                                <Button onClick={pauseGame} variant="outline" className="flex items-center gap-2">
                                                    <Pause className="w-4 h-4" />
                                                    {gameState.isPaused ? 'Resume' : 'Pause'}
                                                </Button>
                                            )}
                                            <Button onClick={resetGame} variant="outline" className="flex items-center gap-2">
                                                <RotateCcw className="w-4 h-4" />
                                                Reset
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-center">
                                        <canvas
                                            ref={canvasRef}
                                            width={CANVAS_WIDTH}
                                            height={CANVAS_HEIGHT}
                                            className="border border-gray-600 rounded-lg bg-black"
                                            tabIndex={0}
                                        />
                                    </div>

                                    <div className="mt-4 text-center text-gray-300 text-sm">
                                        <p>Use WASD or Arrow Keys to move your spaceship</p>
                                        <p>🟫 Avoid asteroids • 🟡 Collect fuel • 🔴 Avoid enemies • 🔵 Collect power-ups</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Panel */}
                        <div className="space-y-4">
                            {/* Current Game Stats */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Rocket className="w-5 h-5" />
                                        Mission Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Score</span>
                                        <Badge variant="secondary">{gameState.score.toLocaleString()}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-300">Level</span>
                                        <Badge variant="secondary">{gameState.level}</Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-gray-300">
                                                <Heart className="w-4 h-4 text-red-500" />
                                                Health
                                            </span>
                                            <span className="text-white">{gameState.health}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${gameState.health}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-gray-300">
                                                <Fuel className="w-4 h-4 text-yellow-500" />
                                                Fuel
                                            </span>
                                            <span className="text-white">{Math.round(gameState.fuel)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${gameState.fuel}%` }}
                                            />
                                        </div>
                                    </div>

                                    {gameState.gameOver && (
                                        <div className="text-center p-4 bg-red-900/50 rounded-lg border border-red-700">
                                            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                            <p className="font-semibold text-red-300">Mission Failed!</p>
                                            <p className="text-sm text-red-400">
                                                Score: {gameState.score.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Best Score */}
                            {bestScore > 0 && (
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-white">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                            Best Mission
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-300">High Score</span>
                                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                                {bestScore.toLocaleString()}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Instructions */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Mission Briefing</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-300 space-y-2">
                                    <p>• Navigate through space using WASD or arrow keys</p>
                                    <p>• Avoid asteroids and enemy ships</p>
                                    <p>• Collect fuel to keep your engines running</p>
                                    <p>• Grab power-ups to restore health</p>
                                    <p>• Survive as long as possible to achieve a high score</p>
                                    <p>• Each level increases the challenge!</p>
                                </CardContent>
                            </Card>

                            {/* Power-ups Legend */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Space Objects</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-300 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                        <span>Fuel Cell (+25 fuel, +50 points)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                                        <span>Health Pack (+20 health, +100 points)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                                        <span>Enemy Ship (-30 health)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-amber-700 rounded"></div>
                                        <span>Asteroid (-20 health)</span>
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

export default SpaceAdventure;