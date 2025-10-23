interface GameThumbnailProps {
    gameTitle: string;
    viewName: string;
    className?: string;
}

const gameThemes = {
    'puzzle-master': {
        emoji: '🧩',
        gradient: 'from-orange-400 via-red-500 to-pink-500',
        pattern: 'puzzle',
        bgColor: '#ff6b35'
    },
    'space-adventure': {
        emoji: '🚀',
        gradient: 'from-indigo-900 via-purple-900 to-blue-900',
        pattern: 'space',
        bgColor: '#1a1a2e'
    },
    'racing-thunder': {
        emoji: '🏎️',
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        pattern: 'racing',
        bgColor: '#f5a623'
    },
    'memory-match': {
        emoji: '🧠',
        gradient: 'from-purple-400 via-pink-500 to-red-500',
        pattern: 'memory',
        bgColor: '#9b59b6'
    },
    'tower-defense-pro': {
        emoji: '🏰',
        gradient: 'from-gray-700 via-gray-800 to-gray-900',
        pattern: 'tower',
        bgColor: '#2c3e50'
    },
    'word-quest': {
        emoji: '📚',
        gradient: 'from-amber-400 via-orange-500 to-yellow-500',
        pattern: 'word',
        bgColor: '#f39c12'
    },
    'ninja-runner': {
        emoji: '🥷',
        gradient: 'from-indigo-600 via-purple-600 to-blue-600',
        pattern: 'ninja',
        bgColor: '#2c2c54'
    },
    'card-master': {
        emoji: '🃏',
        gradient: 'from-green-400 via-emerald-500 to-teal-500',
        pattern: 'cards',
        bgColor: '#27ae60'
    },
    '2048': {
        emoji: '🔢',
        gradient: 'from-yellow-400 via-amber-500 to-orange-500',
        pattern: '2048',
        bgColor: '#f1c40f'
    },
    'simon-says': {
        emoji: '🎯',
        gradient: 'from-red-400 via-pink-500 to-rose-500',
        pattern: 'simon',
        bgColor: '#e74c3c'
    },
    'snake-classic': {
        emoji: '🐍',
        gradient: 'from-green-400 via-emerald-500 to-teal-500',
        pattern: 'snake',
        bgColor: '#16a085'
    },
    'tic-tac-toe': {
        emoji: '⭕',
        gradient: 'from-blue-400 via-cyan-500 to-teal-500',
        pattern: 'tictactoe',
        bgColor: '#3498db'
    }
};

export default function GameThumbnail({ gameTitle, viewName, className = '' }: GameThumbnailProps) {
    const theme = gameThemes[viewName as keyof typeof gameThemes] || {
        emoji: '🎮',
        gradient: 'from-gray-400 via-gray-500 to-gray-600',
        pattern: 'default',
        bgColor: '#6c757d'
    };

    const renderPattern = () => {
        switch (theme.pattern) {
            case 'puzzle':
                return (
                    <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-3 gap-1 h-full p-4">
                            {[...Array(9)].map((_, i) => (
                                <div key={i} className="bg-white/30 rounded border border-white/20"></div>
                            ))}
                        </div>
                    </div>
                );
            case 'space':
                return (
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <div className="absolute top-8 right-6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-300"></div>
                        <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse delay-700"></div>
                        <div className="absolute bottom-4 right-4 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
                    </div>
                );
            case 'racing':
                return (
                    <div className="absolute inset-0 opacity-25">
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/40"></div>
                        <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-white/30"></div>
                        <div className="absolute bottom-8 left-0 right-0 h-0.5 bg-white/30"></div>
                    </div>
                );
            case 'memory':
                return (
                    <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-4 gap-1 h-full p-3">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white/30 rounded aspect-square"></div>
                            ))}
                        </div>
                    </div>
                );
            case 'snake':
                return (
                    <div className="absolute inset-0 opacity-25">
                        <div className="absolute top-1/2 left-4 w-16 h-2 bg-white/40 rounded-full transform -translate-y-1/2"></div>
                        <div className="absolute top-1/3 right-6 w-2 h-2 bg-red-400 rounded-full"></div>
                    </div>
                );
            case 'tictactoe':
                return (
                    <div className="absolute inset-0 opacity-20">
                        <div className="grid grid-cols-3 gap-1 h-full p-6">
                            <div className="border border-white/40"></div>
                            <div className="border border-white/40"></div>
                            <div className="border border-white/40"></div>
                            <div className="border border-white/40"></div>
                            <div className="border border-white/40"></div>
                            <div className="border border-white/40"></div>
                            <div className="border border-white/40"></div>
                            <div className="border border-white/40"></div>
                            <div className="border border-white/40"></div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`aspect-video relative overflow-hidden bg-gradient-to-br ${theme.gradient} ${className}`}>
            {/* Animated background overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
            
            {/* Game-specific patterns */}
            {renderPattern()}
            
            {/* Main emoji/icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl filter drop-shadow-2xl transform transition-transform duration-300 hover:scale-110">
                    {theme.emoji}
                </div>
            </div>
            
            {/* Subtle shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
            
            {/* Game title badge */}
            <div className="absolute bottom-2 left-2 text-xs text-white font-bold bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                {gameTitle}
            </div>
        </div>
    );
}