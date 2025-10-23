import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Shuffle, RotateCcw, Trophy } from 'lucide-react';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
}

interface PageProps {
  auth: {
    user: any;
  };
}

export default function MemoryMatchGame() {
  const { auth } = usePage<SharedData>().props;

  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const emojis = ['🎮', '🎨', '🎭', '🎪', '🎸', '🎹', '🎺', '🎻'];

  const initGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, isFlipped: false }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setIsWon(false);
  };
  
  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (matched.length === emojis.length * 2 && matched.length > 0) {
      setIsWon(true);
    }
  }, [matched]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
      setMoves(moves + 1);
    }
  }, [flipped]);

  const handleClick = (i: number): void => {
    if (flipped.length === 2 || flipped.includes(i) || matched.includes(i)) return;
    setFlipped([...flipped, i]);
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
                            
                            
                            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
                            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
                                <div className="flex justify-between items-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                    <Shuffle className="w-8 h-8 text-purple-600" />
                                    Memory Match
                                </h1>
                                <button
                                    onClick={initGame}
                                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    New Game
                                </button>
                                </div>

                                <div className="mb-6 text-center">
                                <p className="text-2xl font-semibold text-gray-700">
                                    Moves: <span className="text-purple-600">{moves}</span>
                                </p>
                                </div>

                                <div className="grid grid-cols-4 gap-4 mb-8">
                                {cards.map((card, i) => (
                                    <button
                                    key={card.id}
                                    onClick={() => handleClick(i)}
                                    disabled={flipped.includes(i) || matched.includes(i)}
                                    className={`aspect-square rounded-xl text-5xl flex items-center justify-center font-bold transition-all duration-300 transform ${
                                        flipped.includes(i) || matched.includes(i)
                                        ? 'bg-white border-4 border-purple-400 scale-95'
                                        : 'bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-105 hover:shadow-lg'
                                    } ${matched.includes(i) ? 'opacity-60' : ''}`}
                                    >
                                    {flipped.includes(i) || matched.includes(i) ? card.emoji : '❓'}
                                    </button>
                                ))}
                                </div>

                                {isWon && (
                                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-6 rounded-2xl text-center animate-pulse">
                                    <Trophy className="w-12 h-12 mx-auto mb-3" />
                                    <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
                                    <p className="text-xl">You won in {moves} moves!</p>
                                </div>
                                )}
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
