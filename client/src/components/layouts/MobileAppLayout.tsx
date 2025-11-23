import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { cn } from '@/lib/utils';

interface MobileAppLayoutProps {
    children: ReactNode;
    showBottomNav?: boolean;
    className?: string;
}

export function MobileAppLayout({
    children,
    showBottomNav = true,
    className,
}: MobileAppLayoutProps) {
    const [location] = useLocation();

    // Don't show bottom nav on auth pages (login/register only)
    const authPages = ['/login', '/register'];
    const isAuthPage = authPages.includes(location);

    return (
        <div className={cn('min-h-screen bg-background', className)}>
            {/* Main Content */}
            <main
                className={cn(
                    'mobile-scroll',
                    showBottomNav && !isAuthPage && 'pb-bottom-nav'
                )}
            >
                {children}
            </main>

            {/* Bottom Navigation - Only on mobile and authenticated pages */}
            {showBottomNav && !isAuthPage && <BottomNavigation />}
        </div>
    );
}
