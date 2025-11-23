import { ReactNode, useRef, useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileChatLayoutProps {
    children: ReactNode;
    title?: string;
    onExport?: () => void;
    onClear?: () => void;
    onPrint?: () => void;
    className?: string;
}

export function MobileChatLayout({
    children,
    title,
    onExport,
    onClear,
    onPrint,
    className,
}: MobileChatLayoutProps) {
    const [, setLocation] = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-hide header on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                setIsScrolled(scrollRef.current.scrollTop > 50);
            }
        };

        const scrollElement = scrollRef.current;
        scrollElement?.addEventListener('scroll', handleScroll);
        return () => scrollElement?.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={cn('flex flex-col h-screen bg-background md:hidden', className)}>
            {/* Mobile Header */}
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-b border-border pt-safe-top z-fixed transition-transform duration-300',
                    isScrolled && '-translate-y-full'
                )}
                style={{ height: 'calc(var(--mobile-header-height) + env(safe-area-inset-top))' }}
            >
                <div className="flex items-center justify-between h-[var(--mobile-header-height)] px-4">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setLocation('/conversations')}
                        className="touch-target tap-feedback"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    {/* Title */}
                    <h1 className="text-base font-semibold text-foreground truncate flex-1 text-center px-4">
                        {title || 'Chat'}
                    </h1>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="touch-target tap-feedback"
                                aria-label="More options"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {onExport && (
                                <DropdownMenuItem onClick={onExport}>
                                    Export Conversation
                                </DropdownMenuItem>
                            )}
                            {onPrint && (
                                <DropdownMenuItem onClick={onPrint}>
                                    Print
                                </DropdownMenuItem>
                            )}
                            {onClear && (
                                <DropdownMenuItem onClick={onClear} className="text-destructive">
                                    Clear Messages
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto mobile-scroll hide-scrollbar pt-mobile-header pb-bottom-nav"
            >
                {children}
            </div>
        </div>
    );
}
