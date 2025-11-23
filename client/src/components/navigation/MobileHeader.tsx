import { Menu, ArrowLeft, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    showMenu?: boolean;
    onMenuClick?: () => void;
    actions?: React.ReactNode;
    className?: string;
}

export function MobileHeader({
    title,
    showBack = false,
    onBack,
    showMenu = true,
    onMenuClick,
    actions,
    className,
}: MobileHeaderProps) {
    return (
        <header
            className={cn(
                'mobile-only fixed top-0 left-0 right-0 bg-card border-b border-border pt-safe-top z-fixed',
                className
            )}
            style={{ height: 'calc(var(--mobile-header-height) + env(safe-area-inset-top))' }}
        >
            <div className="flex items-center justify-between h-[var(--mobile-header-height)] px-4">
                {/* Left Section */}
                <div className="flex items-center gap-2">
                    {showBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="touch-target tap-feedback"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    {showMenu && !showBack && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onMenuClick}
                            className="touch-target tap-feedback"
                            aria-label="Open menu"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                    )}
                </div>

                {/* Title */}
                {title && (
                    <h1 className="text-lg font-semibold text-foreground truncate flex-1 text-center px-4">
                        {title}
                    </h1>
                )}

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {actions || (
                        <div className="w-10" /> /* Spacer for centering */
                    )}
                </div>
            </div>
        </header>
    );
}
