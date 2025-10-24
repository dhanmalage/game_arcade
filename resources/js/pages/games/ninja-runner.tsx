import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

interface Game {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    view_name: string;
}

interface NinjaRunnerProps {
    game: Game;
}

export default function NinjaRunner({ game }: NinjaRunnerProps) {
    return (
        <>
            <Head title={game.title} />
            
            <AppLayout className="bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 flex items-center justify-center p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12">
                        <div className="text-6xl mb-6">🥷</div>
                        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                            {game.title}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                            {game.description}
                        </p>
                        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-6">
                            <div className="text-4xl mb-4">🚧</div>
                            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                Coming Soon!
                            </h3>
                            <p className="text-yellow-700 dark:text-yellow-300">
                                This game is currently under development. Get ready for an epic ninja running adventure!
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}