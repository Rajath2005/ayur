import { useLocation } from 'wouter';
import { MessageSquare, Home, User, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: number;
}

export function BottomNavigation() {
    const [location, setLocation] = useLocation();

    const navItems: BottomNavItem[] = [
        {
            id: 'chats',
            label: 'Chats',
            icon: <MessageSquare className="w-6 h-6" />,
            path: '/conversations',
        },
        {
            id: 'home',
            label: 'Home',
            icon: <Home className="w-6 h-6" />,
            path: '/dashboard',
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: <User className="w-6 h-6" />,
            path: '/profile',
        },
        {
            id: 'more',
            label: 'More',
            icon: <MoreHorizontal className="w-6 h-6" />,
            path: '/settings',
        },
    ];

    const isActive = (path: string) => {
        return location === path || location.startsWith(path + '/');
    };

    return (
        <nav
            className="mobile-only fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border/50 pb-safe-bottom z-fixed shadow-[0_-2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.3)]"
            style={{ height: 'calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))' }}
        >
            <div className="flex items-center justify-around h-[var(--bottom-nav-height)] px-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => setLocation(item.path)}
                            className={cn(
                                'flex flex-col items-center justify-center gap-1 touch-target-comfortable relative tap-feedback rounded-2xl px-4 py-2',
                                'transition-all duration-300 ease-out',
                                active
                                    ? 'text-primary scale-105'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            )}
                            aria-label={item.label}
                            aria-current={active ? 'page' : undefined}
                        >
                            {/* Active Background */}
                            {active && (
                                <div className="absolute inset-0 bg-primary/10 rounded-2xl animate-scale-in" />
                            )}

                            <div className="relative z-10">
                                <div className={cn(
                                    "relative transition-transform duration-300",
                                    active && "scale-110"
                                )}>
                                    {item.icon}
                                    {item.badge && item.badge > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-scale-in shadow-lg">
                                            {item.badge > 9 ? '9+' : item.badge}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <span className={cn(
                                'text-[11px] font-medium transition-all duration-300 relative z-10',
                                active ? 'font-semibold opacity-100' : 'opacity-70'
                            )}>
                                {item.label}
                            </span>

                            {/* Active Indicator */}
                            {active && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full animate-scale-in shadow-lg shadow-primary/50" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
