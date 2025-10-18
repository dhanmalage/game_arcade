import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, RotateCcw, Play, Trophy } from 'lucide-react';

export default function SimonSays() {
    const { auth } = usePage<SharedData>().props;
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speed, setSpeed] = useState(600);
  
  const audioContext = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  const colors = [
    { id: 0, color: 'bg-red-500', activeColor: 'bg-red-300', freq: 329.63 },
    { id: 1, color: 'bg-blue-500', activeColor: 'bg-blue-300', freq: 261.63 },
    { id: 2, color: 'bg-green-500', activeColor: 'bg-green-300', freq: 392.00 },
    { id: 3, color: 'bg-yellow-500', activeColor: 'bg-yellow-300', freq: 440.00 }
  ];

  const playSound = (frequency) => {
    if (!soundEnabled || !audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.3);
    
    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + 0.3);
  };

  const flashButton = (colorId, duration = speed) => {
    return new Promise((resolve) => {
      setActiveButton(colorId);
      playSound(colors[colorId].freq);
      setTimeout(() => {
        setActiveButton(null);
        setTimeout(resolve, 100);
      }, duration);
    });
  };

  const playSequence = async () => {
    setIsPlaying(true);
    setIsPlayerTurn(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (let colorId of sequence) {
      await flashButton(colorId);
    }
    
    setIsPlayerTurn(true);
    setIsPlaying(false);
  };

  const startGame = () => {
    setGameOver(false);
    setScore(0);
    setSequence([]);
    setPlayerSequence([]);
    nextRound([]);
  };

  const nextRound = (currentSequence) => {
    const newSequence = [...currentSequence, Math.floor(Math.random() * 4)];
    setSequence(newSequence);
    setPlayerSequence([]);
    setTimeout(() => playSequenceWithDelay(newSequence), 500);
  };

  const playSequenceWithDelay = async (seq) => {
    setIsPlaying(true);
    setIsPlayerTurn(false);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (let colorId of seq) {
      await flashButton(colorId);
    }
    
    setIsPlayerTurn(true);
    setIsPlaying(false);
  };

  const handleButtonClick = async (colorId) => {
    if (!isPlayerTurn || isPlaying) return;
    
    await flashButton(colorId, 300);
    
    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);
    
    const currentIndex = newPlayerSequence.length - 1;
    
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      endGame();
      return;
    }
    
    if (newPlayerSequence.length === sequence.length) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      setIsPlayerTurn(false);
      
      if (newScore % 5 === 0 && speed > 200) {
        setSpeed(prev => prev - 50);
      }
      
      setTimeout(() => nextRound(sequence), 1000);
    }
  };

  const endGame = () => {
    setGameOver(true);
    setIsPlayerTurn(false);
    setIsPlaying(false);
    
    const wrongSound = audioContext.current?.createOscillator();
    const gainNode = audioContext.current?.createGain();
    
    if (wrongSound && gainNode && soundEnabled) {
      wrongSound.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      wrongSound.frequency.value = 110;
      wrongSound.type = 'sawtooth';
      gainNode.gain.setValueAtTime(0.3, audioContext.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + 0.5);
      wrongSound.start();
      wrongSound.stop(audioContext.current.currentTime + 0.5);
    }
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
                            
                            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                            <div className="max-w-2xl w-full">
                                {/* Header */}
                                <div className="text-center mb-8">
                                <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">Simon Says</h1>
                                <p className="text-blue-200 text-lg">Watch, remember, and repeat the pattern!</p>
                                </div>

                                {/* Score Display */}
                                <div className="flex justify-center gap-8 mb-8">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-center">
                                    <div className="text-blue-200 text-sm font-semibold mb-1">Score</div>
                                    <div className="text-white text-3xl font-bold">{score}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 text-center">
                                    <div className="text-yellow-200 text-sm font-semibold mb-1 flex items-center justify-center gap-1">
                                    <Trophy size={14} />
                                    Best
                                    </div>
                                    <div className="text-white text-3xl font-bold">{highScore}</div>
                                </div>
                                </div>

                                {/* Game Board */}
                                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 mb-6 shadow-2xl">
                                <div className="grid grid-cols-2 gap-4 aspect-square max-w-md mx-auto">
                                    {colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => handleButtonClick(color.id)}
                                        disabled={!isPlayerTurn || isPlaying}
                                        className={`
                                        ${activeButton === color.id ? color.activeColor : color.color}
                                        rounded-2xl transition-all duration-150 transform
                                        ${isPlayerTurn && !isPlaying ? 'hover:scale-95 cursor-pointer' : 'cursor-not-allowed opacity-80'}
                                        ${activeButton === color.id ? 'scale-95 shadow-2xl' : 'shadow-lg'}
                                        disabled:cursor-not-allowed
                                        `}
                                    />
                                    ))}
                                </div>

                                {/* Status Message */}
                                <div className="text-center mt-6 h-8">
                                    {gameOver && (
                                    <div className="text-red-300 text-xl font-semibold animate-pulse">
                                        Game Over! Final Score: {score}
                                    </div>
                                    )}
                                    {isPlaying && !gameOver && (
                                    <div className="text-blue-300 text-xl font-semibold">
                                        Watch the pattern...
                                    </div>
                                    )}
                                    {isPlayerTurn && !gameOver && (
                                    <div className="text-green-300 text-xl font-semibold">
                                        Your turn!
                                    </div>
                                    )}
                                    {!isPlaying && !isPlayerTurn && !gameOver && sequence.length === 0 && (
                                    <div className="text-white/70 text-lg">
                                        Press Start to begin
                                    </div>
                                    )}
                                </div>
                                </div>

                                {/* Controls */}
                                <div className="flex justify-center gap-4">
                                <button
                                    onClick={startGame}
                                    disabled={isPlaying}
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                                >
                                    {gameOver || sequence.length === 0 ? (
                                    <>
                                        <Play size={20} />
                                        Start Game
                                    </>
                                    ) : (
                                    <>
                                        <RotateCcw size={20} />
                                        Restart
                                    </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="bg-white/10 hover:bg-white/20 text-white font-bold p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    title={soundEnabled ? 'Mute' : 'Unmute'}
                                >
                                    {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                                </button>
                                </div>

                                {/* Instructions */}
                                <div className="mt-8 text-center text-blue-200 text-sm">
                                <p>Watch the sequence and click the colors in the same order.</p>
                                <p className="mt-1">The game gets faster every 5 rounds!</p>
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
