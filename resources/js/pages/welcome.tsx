import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import AppearanceToggleCompact from '@/components/appearance-toggle-compact';

interface Game {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
}

interface WelcomeProps extends SharedData {
    featuredGames: Game[];
}

export default function Welcome() {
    const { auth, featuredGames } = usePage<WelcomeProps>().props;

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
                <header className="mb-6 w-full max-w-7xl text-sm">                    
                    <nav className="flex items-center justify-end gap-4">
                        <AppearanceToggleCompact />
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
                
                <div className="w-full max-w-7xl mx-auto px-6 py-12">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] mb-4">
                            Game Arcade
                        </h1>
                        <p className="text-lg text-[#706f6c] dark:text-[#A1A09A]">
                            Discover amazing games and start playing now
                        </p>
                    </div>

                    {featuredGames && featuredGames.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {featuredGames.map((game) => (
                                <Link
                                    key={game.id}
                                    href={`/game/${game.id}`}
                                    className="group bg-white dark:bg-[#161615] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="aspect-video bg-gradient-to-br from-[#f53003] to-[#ff6b35] relative overflow-hidden">
                                        {game.thumbnail ? (
                                            <img
                                                src={game.thumbnail}
                                                alt={game.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-white text-4xl font-bold opacity-50">
                                                    {game.title.charAt(0)}
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                            <div className="bg-white bg-opacity-90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <svg className="w-6 h-6 text-[#f53003]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M8 5v10l7-5-7-5z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC] mb-2 group-hover:text-[#f53003] transition-colors">
                                            {game.title}
                                        </h3>
                                        <p className="text-sm text-[#706f6c] dark:text-[#A1A09A] line-clamp-2">
                                            {game.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🎮</div>
                            <h3 className="text-xl font-semibold text-[#1b1b18] dark:text-[#EDEDEC] mb-2">
                                No games available yet
                            </h3>
                            <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                Check back soon for exciting games to play!
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}