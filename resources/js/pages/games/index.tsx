import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import GameThumbnail from '@/components/game-thumbnail';

interface Game {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    view_name?: string;
}

interface GamesIndexProps extends SharedData {
    games: Game[];
}

export default function GamesIndex() {
    const { games } = usePage<GamesIndexProps>().props;

    return (
        <>
            <Head title="All Games">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <AppLayout>
                <div className="w-full max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#f53003] via-[#ff6b35] to-[#f53003] bg-clip-text text-transparent mb-6">
                            🎮 All Games
                        </h1>
                        <p className="text-xl text-[#706f6c] dark:text-[#A1A09A] mb-4 max-w-2xl mx-auto">
                            Browse our complete collection of games
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {games?.length || 0} Games Available
                            </span>
                            <span>•</span>
                            <span>Free to Play</span>
                            <span>•</span>
                            <span>No Downloads Required</span>
                        </div>
                    </div>

                    {games && games.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {games.map((game) => (
                                <Link
                                    key={game.id}
                                    href={`/game/${game.id}`}
                                    className="group bg-white dark:bg-[#161615] rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-800"
                                >
                                    <div className="relative overflow-hidden">
                                        <GameThumbnail 
                                            gameTitle={game.title}
                                            viewName={game.view_name || 'default'}
                                            className="group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                                <svg className="w-8 h-8 text-[#f53003]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M8 5v10l7-5-7-5z"/>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-[#f53003] text-white text-xs px-2 py-1 rounded-full font-medium">
                                                Play Now
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-[#1b1b18] dark:text-[#EDEDEC] mb-2 group-hover:text-[#f53003] transition-colors line-clamp-1">
                                            {game.title}
                                        </h3>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] line-clamp-2 leading-relaxed">
                                            {game.description}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                Free
                                            </div>
                                            <div className="text-[#f53003] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                Play →
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-8xl mb-6 animate-bounce">🎮</div>
                            <h3 className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] mb-3">
                                No games available yet
                            </h3>
                            <p className="text-lg text-[#706f6c] dark:text-[#A1A09A] mb-6 max-w-md mx-auto">
                                We're working hard to bring you amazing games. Check back soon!
                            </p>
                            <div className="inline-flex items-center gap-2 text-sm text-[#706f6c] dark:text-[#A1A09A] bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                Coming Soon
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}