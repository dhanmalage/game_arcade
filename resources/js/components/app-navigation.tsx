import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppearanceToggleCompact from '@/components/appearance-toggle-compact';
import { cn } from '@/lib/utils';

interface NavItem {
    title: string;
    href: string;
    active?: boolean;
}

export default function AppNavigation() {
    const { auth } = usePage<SharedData>().props;
    const page = usePage();

    const mainNavItems: NavItem[] = [
        {
            title: 'Home',
            href: '/',
            active: page.url === '/',
        },
        {
            title: 'Games',
            href: '/game',
            active: page.url.startsWith('/game'),
        },
    ];

    return (
        <header className="w-full border-b border-[#19140035] dark:border-[#3E3E3A] bg-[#FDFDFC] dark:bg-[#0a0a0a]">
            <div className="mx-auto max-w-7xl px-6">
                <nav className="flex h-16 items-center justify-between">
                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-xl font-bold text-[#1b1b18] dark:text-[#EDEDEC] hover:text-[#f53003] transition-colors"
                        >
                            🎮 Game Arcade
                        </Link>

                        {/* Main Navigation */}
                        <div className="hidden md:flex items-center space-x-6">
                            {mainNavItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={cn(
                                        "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        item.active
                                            ? "text-[#f53003] bg-[#f53003]/10"
                                            : "text-[#706f6c] dark:text-[#A1A09A] hover:text-[#1b1b18] dark:hover:text-[#EDEDEC] hover:bg-[#19140035] dark:hover:bg-[#3E3E3A]"
                                    )}
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side navigation */}
                    <div className="flex items-center space-x-4">
                        <AppearanceToggleCompact />
                        
                        {auth.user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Welcome, {auth.user.name}
                                </span>
                                <Link
                                    href={dashboard()}
                                    className="inline-block rounded-sm border border-[#19140035] px-4 py-2 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] hover:bg-[#19140035] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b] dark:hover:bg-[#3E3E3A] transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-4 py-2 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] hover:bg-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A] dark:hover:bg-[#3E3E3A] transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-block rounded-sm border border-[#19140035] px-4 py-2 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] hover:bg-[#19140035] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b] dark:hover:bg-[#3E3E3A] transition-colors"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="p-2 text-[#706f6c] dark:text-[#A1A09A] hover:text-[#1b1b18] dark:hover:text-[#EDEDEC]">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
}