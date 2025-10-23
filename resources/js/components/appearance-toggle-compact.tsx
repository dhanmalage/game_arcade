import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleCompact({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light mode' },
        { value: 'dark', icon: Moon, label: 'Dark mode' },
        { value: 'system', icon: Monitor, label: 'System theme' },
    ];

    return (
        <div
            className={cn(
                'inline-flex gap-0.5 rounded-sm bg-[#19140035] p-0.5 dark:bg-[#3E3E3A]',
                className,
            )}
            {...props}
        >
            {tabs.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    onClick={() => updateAppearance(value)}
                    title={label}
                    className={cn(
                        'flex items-center justify-center rounded-sm p-1.5 transition-colors',
                        appearance === value
                            ? 'bg-white shadow-sm text-[#1b1b18] dark:bg-[#161615] dark:text-[#EDEDEC]'
                            : 'text-[#706f6c] hover:bg-white/60 hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#161615]/60 dark:hover:text-[#EDEDEC]',
                    )}
                >
                    <Icon className="h-4 w-4" />
                </button>
            ))}
        </div>
    );
}