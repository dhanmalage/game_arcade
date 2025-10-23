import { ReactNode } from 'react';
import AppNavigation from '@/components/app-navigation';

interface AppLayoutProps {
    children: ReactNode;
    className?: string;
}

export default function AppLayout({ children, className = '' }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
            <AppNavigation />
            <main className={className}>
                {children}
            </main>
        </div>
    );
}