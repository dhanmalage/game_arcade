import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Trophy, Zap, Shield, Target, Coins, Heart, Swords } from 'lucide-react';

interface Game {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    view_name: string;
}

interface TowerDefenseProProps {
    game: Game;
}

interface Position {
    x: number;
    y: number;
}

interface Tower {
    id: string;
    x: number;
    y: number;
    type: 'archer' | 'cannon' | 'magic' | 'ice';
    level: number;
    damage: number;
    range: number;
    fireRate: number;
    lastFired: number;
    cost: number;
    upgradeCost: number;
}

interface Enemy {
    id: string;
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    speed: number;
    pathIndex: number;
    type: 'basic' | 'fast' | 'heavy' | 'boss';
    reward: number;
    color: string;
}

interface Projectile {
    id: string;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    damage: number;
    speed: number;
    type: string;
    color: string;
}

interface Wave {
    enemies: { type: Enemy['type']; count: number; delay: number }[];
    reward: number;
}

interface GameState {
    towers: Tower[];
    enemies: Enemy[];
    projectiles: Projectile[];
    selectedTower: Tower | null;
    selectedTowerType: Tower['type'] | null;
    money: number;
    health: number;
    wave: number;
    score: number;
    isPlaying: boolean;
    isPaused: boolean;
    gameOver: boolean;
    waveInProgress: boolean;
    enemiesSpawned: number;
    enemiesInWave: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 40;

// Game path (enemies follow this route)
const gamePath: Position[] = [
    { x: 0, y: 300 },
    { x: 160, y: 300 },
    { x: 160, y: 120 },
    { x: 400, y: 120 },
    { x: 400, y: 480 },
    { x: 640, y: 480 },
    { x: 640, y: 240 },
    { x: 800, y: 240 }
];

const towerTypes = {
    archer: { damage: 25, range: 120, fireRate: 1000, cost: 50, color: '#22c55e' },
    cannon: { damage: 80, range: 100, fireRate: 2000, cost: 100, color: '#ef4444' },
    magic: { damage: 40, range: 140, fireRate: 800, cost: 150, color: '#8b5cf6' },
    ice: { damage: 15, range: 110, fireRate: 1200, cost: 75, color: '#06b6d4' }
};

const enemyTypes = {
    basic: { health: 100, speed: 1, reward: 10, color: '#fbbf24' },
    fast: { health: 60, speed: 2, reward: 15, color: '#10b981' },
    heavy: { health: 200, speed: 0.5, reward: 25, color: '#dc2626' },
    boss: { health: 500, speed: 0.8, reward: 100, color: '#7c3aed' }
};

const waves: Wave[] = [
    { enemies: [{ type: 'basic', count: 10, delay: 1000 }], reward: 50 },
    { enemies: [{ type: 'basic', count: 15, delay: 800 }], reward: 75 },
    { enemies: [{ type: 'basic', count: 10, delay: 600 }, { type: 'fast', count: 5, delay: 1000 }], reward: 100 },
    { enemies: [{ type: 'fast', count: 12, delay: 500 }], reward: 120 },
    { enemies: [{ type: 'heavy', count: 3, delay: 2000 }, { type: 'basic', count: 15, delay: 400 }], reward: 150 },
    { enemies: [{ type: 'boss', count: 1, delay: 3000 }, { type: 'fast', count: 20, delay: 300 }], reward: 200 }
];

const TowerDefensePro: React.FC<TowerDefenseProProps> = ({ game }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | undefined>(undefined);

    const [gameState, setGameState] = useState<GameState>({
        towers: [],
        enemies: [],
        projectiles: [],
        selectedTower: null,
        selectedTowerType: null,
        money: 200,
        health: 100,
        wave: 1,
        score: 0,
        isPlaying: false,
        isPaused: false,
        gameOver: false,
        waveInProgress: false,
        enemiesSpawned: 0,
        enemiesInWave: 0
    });

    const [bestScore, setBestScore] = useState<number>(0);
    const [hoveredCell, setHoveredCell] = useState<Position | null>(null);

    // Initialize game
    const initializeGame = useCallback(() => {
        setGameState({
            towers: [],
            enemies: [],
            projectiles: [],
            selectedTower: null,
            selectedTowerType: null,
            money: 200,
            health: 100,
            wave: 1,
            score: 0,
            isPlaying: false,
            isPaused: false,
            gameOver: false,
            waveInProgress: false,
            enemiesSpawned: 0,
            enemiesInWave: 0
        });
    }, []);

    // Handle canvas click
    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if clicking on existing tower
        const clickedTower = gameState.towers.find(tower =>
            Math.sqrt(Math.pow(tower.x - x, 2) + Math.pow(tower.y - y, 2)) < 20
        );

        if (clickedTower) {
            setGameState(prev => ({ ...prev, selectedTower: clickedTower, selectedTowerType: null }));
            return;
        }

        // Place new tower
        if (gameState.selectedTowerType && gameState.money >= towerTypes[gameState.selectedTowerType].cost) {
            const gridX = Math.floor(x / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
            const gridY = Math.floor(y / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;

            // Check if position is valid (not on path, not occupied)
            const isOnPath = gamePath.some(point =>
                Math.abs(point.x - gridX) < GRID_SIZE && Math.abs(point.y - gridY) < GRID_SIZE
            );

            const isOccupied = gameState.towers.some(tower =>
                Math.abs(tower.x - gridX) < GRID_SIZE && Math.abs(tower.y - gridY) < GRID_SIZE
            );

            if (!isOnPath && !isOccupied && gridX >= 0 && gridX <= CANVAS_WIDTH && gridY >= 0 && gridY <= CANVAS_HEIGHT) {
                const towerType = towerTypes[gameState.selectedTowerType];
                const newTower: Tower = {
                    id: Date.now().toString(),
                    x: gridX,
                    y: gridY,
                    type: gameState.selectedTowerType,
                    level: 1,
                    damage: towerType.damage,
                    range: towerType.range,
                    fireRate: towerType.fireRate,
                    lastFired: 0,
                    cost: towerType.cost,
                    upgradeCost: Math.floor(towerType.cost * 1.5)
                };

                setGameState(prev => ({
                    ...prev,
                    towers: [...prev.towers, newTower],
                    money: prev.money - towerType.cost,
                    selectedTowerType: null,
                    selectedTower: newTower
                }));
            }
        } else {
            setGameState(prev => ({ ...prev, selectedTower: null, selectedTowerType: null }));
        }
    };

    // Handle canvas mouse move
    const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const gridX = Math.floor(x / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
        const gridY = Math.floor(y / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;

        setHoveredCell({ x: gridX, y: gridY });
    };

    // Spawn enemy
    const spawnEnemy = (type: Enemy['type']): Enemy => {
        const enemyType = enemyTypes[type];
        return {
            id: Date.now().toString() + Math.random(),
            x: gamePath[0].x,
            y: gamePath[0].y,
            health: enemyType.health,
            maxHealth: enemyType.health,
            speed: enemyType.speed,
            pathIndex: 0,
            type,
            reward: enemyType.reward,
            color: enemyType.color
        };
    };

    // Start wave
    const startWave = useCallback(() => {
        if (gameState.wave > waves.length) return;

        const currentWave = waves[gameState.wave - 1];
        let totalEnemies = 0;
        currentWave.enemies.forEach(enemyGroup => {
            totalEnemies += enemyGroup.count;
        });

        setGameState(prev => ({
            ...prev,
            waveInProgress: true,
            enemiesSpawned: 0,
            enemiesInWave: totalEnemies
        }));

        // Spawn enemies with delays
        let spawnDelay = 0;
        currentWave.enemies.forEach(enemyGroup => {
            for (let i = 0; i < enemyGroup.count; i++) {
                setTimeout(() => {
                    setGameState(prev => {
                        const newEnemy = spawnEnemy(enemyGroup.type);
                        return {
                            ...prev,
                            enemies: [...prev.enemies, newEnemy],
                            enemiesSpawned: prev.enemiesSpawned + 1
                        };
                    });
                }, spawnDelay);
                spawnDelay += enemyGroup.delay;
            }
        });
    }, [gameState.wave]);

    // Update game state
    const updateGame = useCallback(() => {
        if (!gameState.isPlaying || gameState.isPaused || gameState.gameOver) return;

        setGameState(prevState => {
            const newState = { ...prevState };
            const currentTime = Date.now();

            // Update enemies
            newState.enemies = newState.enemies.filter(enemy => {
                // Move enemy along path
                if (enemy.pathIndex < gamePath.length - 1) {
                    const currentPoint = gamePath[enemy.pathIndex];
                    const nextPoint = gamePath[enemy.pathIndex + 1];

                    const dx = nextPoint.x - currentPoint.x;
                    const dy = nextPoint.y - currentPoint.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance > 0) {
                        enemy.x += (dx / distance) * enemy.speed;
                        enemy.y += (dy / distance) * enemy.speed;

                        // Check if reached next point
                        if (Math.abs(enemy.x - nextPoint.x) < 5 && Math.abs(enemy.y - nextPoint.y) < 5) {
                            enemy.pathIndex++;
                            enemy.x = nextPoint.x;
                            enemy.y = nextPoint.y;
                        }
                    }
                } else {
                    // Enemy reached the end
                    newState.health -= 10;
                    if (newState.health <= 0) {
                        newState.gameOver = true;
                        newState.isPlaying = false;
                    }
                    return false;
                }

                return enemy.health > 0;
            });

            // Update projectiles
            newState.projectiles = newState.projectiles.filter(projectile => {
                const dx = projectile.targetX - projectile.x;
                const dy = projectile.targetY - projectile.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < projectile.speed) {
                    // Projectile hit target
                    const targetEnemy = newState.enemies.find(enemy =>
                        Math.abs(enemy.x - projectile.targetX) < 20 && Math.abs(enemy.y - projectile.targetY) < 20
                    );

                    if (targetEnemy) {
                        targetEnemy.health -= projectile.damage;
                        if (targetEnemy.health <= 0) {
                            newState.money += targetEnemy.reward;
                            newState.score += targetEnemy.reward * 10;
                        }
                    }
                    return false;
                } else {
                    projectile.x += (dx / distance) * projectile.speed;
                    projectile.y += (dy / distance) * projectile.speed;
                    return true;
                }
            });

            // Tower shooting
            newState.towers.forEach(tower => {
                if (currentTime - tower.lastFired > tower.fireRate) {
                    // Find nearest enemy in range
                    let nearestEnemy: Enemy | null = null;
                    let nearestDistance = Infinity;

                    newState.enemies.forEach(enemy => {
                        const distance = Math.sqrt(
                            Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2)
                        );
                        if (distance <= tower.range && distance < nearestDistance) {
                            nearestEnemy = enemy;
                            nearestDistance = distance;
                        }
                    });

                    if (nearestEnemy) {
                        const enemy = nearestEnemy as Enemy;
                        const projectile: Projectile = {
                            id: Date.now().toString() + Math.random(),
                            x: tower.x,
                            y: tower.y,
                            targetX: enemy.x,
                            targetY: enemy.y,
                            damage: tower.damage,
                            speed: 8,
                            type: tower.type,
                            color: towerTypes[tower.type].color
                        };

                        newState.projectiles.push(projectile);
                        tower.lastFired = currentTime;
                    }
                }
            });

            // Check wave completion
            if (newState.waveInProgress && newState.enemies.length === 0 && newState.enemiesSpawned >= newState.enemiesInWave) {
                newState.waveInProgress = false;
                newState.money += waves[newState.wave - 1]?.reward || 0;
                newState.wave++;
            }

            return newState;
        });
    }, [gameState.isPlaying, gameState.isPaused, gameState.gameOver]);

    // Render game
    const render = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Draw grid
        ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
            ctx.stroke();
        }

        // Draw path
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 40;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        gamePath.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();

        // Draw path borders
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw hovered cell
        if (hoveredCell && gameState.selectedTowerType) {
            const isOnPath = gamePath.some(point =>
                Math.abs(point.x - hoveredCell.x) < GRID_SIZE && Math.abs(point.y - hoveredCell.y) < GRID_SIZE
            );
            const isOccupied = gameState.towers.some(tower =>
                Math.abs(tower.x - hoveredCell.x) < GRID_SIZE && Math.abs(tower.y - hoveredCell.y) < GRID_SIZE
            );

            ctx.fillStyle = isOnPath || isOccupied ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)';
            ctx.fillRect(
                hoveredCell.x - GRID_SIZE / 2,
                hoveredCell.y - GRID_SIZE / 2,
                GRID_SIZE,
                GRID_SIZE
            );
        }

        // Draw tower ranges
        if (gameState.selectedTower) {
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(gameState.selectedTower.x, gameState.selectedTower.y, gameState.selectedTower.range, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        // Draw towers
        gameState.towers.forEach(tower => {
            ctx.fillStyle = towerTypes[tower.type].color;
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, 15, 0, 2 * Math.PI);
            ctx.fill();

            // Tower level
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(tower.level.toString(), tower.x, tower.y + 4);

            // Selection indicator
            if (gameState.selectedTower?.id === tower.id) {
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(tower.x, tower.y, 20, 0, 2 * Math.PI);
                ctx.stroke();
            }
        });

        // Draw enemies
        gameState.enemies.forEach(enemy => {
            // Enemy body
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, 12, 0, 2 * Math.PI);
            ctx.fill();

            // Health bar
            const healthPercent = enemy.health / enemy.maxHealth;
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(enemy.x - 15, enemy.y - 20, 30, 4);
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(enemy.x - 15, enemy.y - 20, 30 * healthPercent, 4);
        });

        // Draw projectiles
        gameState.projectiles.forEach(projectile => {
            ctx.fillStyle = projectile.color;
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw game over screen
        if (gameState.gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

            ctx.font = '24px Arial';
            ctx.fillText(`Final Score: ${gameState.score.toLocaleString()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.fillText(`Wave Reached: ${gameState.wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
        }
    }, [gameState, hoveredCell]);

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
        const saved = localStorage.getItem('towerDefenseBest');
        if (saved) {
            setBestScore(parseInt(saved));
        }
    }, []);

    // Update best score
    useEffect(() => {
        if (gameState.gameOver && gameState.score > bestScore) {
            setBestScore(gameState.score);
            localStorage.setItem('towerDefenseBest', gameState.score.toString());
        }
    }, [gameState.gameOver, gameState.score, bestScore]);

    const startGame = () => {
        setGameState(prev => ({ ...prev, isPlaying: true }));
    };

    const pauseGame = () => {
        setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    };

    const resetGame = () => {
        initializeGame();
    };

    const upgradeTower = () => {
        if (!gameState.selectedTower || gameState.money < gameState.selectedTower.upgradeCost) return;

        setGameState(prev => ({
            ...prev,
            towers: prev.towers.map(tower =>
                tower.id === prev.selectedTower?.id
                    ? {
                        ...tower,
                        level: tower.level + 1,
                        damage: Math.floor(tower.damage * 1.5),
                        range: Math.floor(tower.range * 1.1),
                        upgradeCost: Math.floor(tower.upgradeCost * 1.5)
                    }
                    : tower
            ),
            money: prev.money - (prev.selectedTower?.upgradeCost || 0)
        }));
    };

    const sellTower = () => {
        if (!gameState.selectedTower) return;

        setGameState(prev => ({
            ...prev,
            towers: prev.towers.filter(tower => tower.id !== prev.selectedTower?.id),
            money: prev.money + Math.floor((prev.selectedTower?.cost || 0) * 0.7),
            selectedTower: null
        }));
    };

    return (
        <>
            <Head title={game.title} />

            <AppLayout className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
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
                                            <Shield className="w-6 h-6 text-purple-500" />
                                            Defense Grid
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            {!gameState.isPlaying ? (
                                                <Button onClick={startGame} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                                                    <Play className="w-4 h-4" />
                                                    Start Defense
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
                                    <div className="flex justify-center mb-4">
                                        <canvas
                                            ref={canvasRef}
                                            width={CANVAS_WIDTH}
                                            height={CANVAS_HEIGHT}
                                            className="border-2 border-gray-600 rounded-lg bg-gray-900 cursor-crosshair"
                                            onClick={handleCanvasClick}
                                            onMouseMove={handleCanvasMouseMove}
                                        />
                                    </div>

                                    {/* Tower Selection */}
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {Object.entries(towerTypes).map(([type, config]) => (
                                            <Button
                                                key={type}
                                                onClick={() => setGameState(prev => ({
                                                    ...prev,
                                                    selectedTowerType: type as Tower['type'],
                                                    selectedTower: null
                                                }))}
                                                variant={gameState.selectedTowerType === type ? "default" : "outline"}
                                                disabled={gameState.money < config.cost}
                                                className="flex flex-col items-center p-3 h-auto"
                                                style={{
                                                    backgroundColor: gameState.selectedTowerType === type ? config.color : 'transparent',
                                                    borderColor: config.color
                                                }}
                                            >
                                                <div className="font-semibold capitalize">{type}</div>
                                                <div className="text-xs opacity-75">${config.cost}</div>
                                            </Button>
                                        ))}
                                    </div>

                                    {/* Wave Control */}
                                    <div className="flex justify-center gap-4">
                                        <Button
                                            onClick={startWave}
                                            disabled={gameState.waveInProgress || !gameState.isPlaying || gameState.wave > waves.length}
                                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                                        >
                                            <Swords className="w-4 h-4" />
                                            {gameState.waveInProgress ? 'Wave in Progress' : `Start Wave ${gameState.wave}`}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stats Panel */}
                        <div className="space-y-4">
                            {/* Game Status */}
                            <Card className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-purple-700 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Target className="w-5 h-5 text-yellow-400" />
                                        Battle Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-gray-200">
                                            <Coins className="w-4 h-4 text-yellow-500" />
                                            Money
                                        </span>
                                        <Badge variant="secondary" className="bg-yellow-600 text-white">
                                            ${gameState.money}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2 text-gray-200">
                                            <Heart className="w-4 h-4 text-red-500" />
                                            Health
                                        </span>
                                        <Badge variant="secondary" className="bg-red-600 text-white">
                                            {gameState.health}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-200">Wave</span>
                                        <Badge variant="outline" className="text-purple-400 border-purple-400">
                                            {gameState.wave}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-200">Score</span>
                                        <Badge variant="outline" className="text-green-400 border-green-400">
                                            {gameState.score.toLocaleString()}
                                        </Badge>
                                    </div>

                                    {gameState.gameOver && (
                                        <div className="text-center p-4 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-lg border border-red-500/50">
                                            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                            <p className="font-semibold text-red-300">Defense Failed!</p>
                                            <p className="text-sm text-red-400">
                                                Final Score: {gameState.score.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Selected Tower */}
                            {gameState.selectedTower && (
                                <Card className="bg-gradient-to-br from-blue-900/90 to-cyan-900/90 border-blue-700 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="text-white capitalize">
                                            {gameState.selectedTower.type} Tower
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>Level: {gameState.selectedTower.level}</div>
                                            <div>Damage: {gameState.selectedTower.damage}</div>
                                            <div>Range: {gameState.selectedTower.range}</div>
                                            <div>Fire Rate: {(1000 / gameState.selectedTower.fireRate).toFixed(1)}/s</div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={upgradeTower}
                                                disabled={gameState.money < gameState.selectedTower.upgradeCost}
                                                size="sm"
                                                className="flex-1"
                                            >
                                                Upgrade (${gameState.selectedTower.upgradeCost})
                                            </Button>
                                            <Button
                                                onClick={sellTower}
                                                variant="destructive"
                                                size="sm"
                                                className="flex-1"
                                            >
                                                Sell (${Math.floor(gameState.selectedTower.cost * 0.7)})
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Best Score */}
                            {bestScore > 0 && (
                                <Card className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 border-yellow-700 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-white">
                                            <Trophy className="w-5 h-5 text-yellow-500" />
                                            Best Defense
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-200">High Score</span>
                                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                                {bestScore.toLocaleString()}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Tower Guide */}
                            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white">Tower Guide</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-gray-300 space-y-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span>Archer - Fast, cheap, good for swarms</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span>Cannon - High damage, slow rate</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                            <span>Magic - Balanced, long range</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                                            <span>Ice - Slows enemies, low damage</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-600">
                                        <p className="text-xs text-gray-400">
                                            Click to place towers, select to upgrade or sell.
                                            Prevent enemies from reaching the end!
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
};

export default TowerDefensePro;