import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FloatingInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onAttach?: () => void;
    placeholder?: string;
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
}

export function FloatingInput({
    value,
    onChange,
    onSend,
    onAttach,
    placeholder = 'Type a message...',
    disabled = false,
    isLoading = false,
    className,
}: FloatingInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [value]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div
            className={cn(
                'fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border pb-safe-bottom z-fixed md:hidden',
                'shadow-[0_-4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.3)]',
                className
            )}
        >
            <div className="p-4 pb-[calc(var(--bottom-nav-height)+1rem)]">
                <div
                    className={cn(
                        'flex items-end gap-2 p-2 rounded-[24px] bg-background border-2 transition-all duration-200',
                        isFocused
                            ? 'border-primary shadow-lg shadow-primary/20'
                            : 'border-border shadow-md'
                    )}
                >
                    {/* Attach Button (Optional) */}
                    {onAttach && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onAttach}
                            className="shrink-0 h-10 w-10 rounded-full tap-feedback"
                            disabled={disabled}
                            aria-label="Attach file"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    )}

                    {/* Input */}
                    <Textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={cn(
                            'flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0',
                            'min-h-[44px] max-h-[120px] py-2.5 px-2 text-base placeholder:text-muted-foreground/60'
                        )}
                        rows={1}
                    />

                    {/* Send Button */}
                    <Button
                        onClick={onSend}
                        disabled={!value.trim() || disabled || isLoading}
                        size="icon"
                        className={cn(
                            'shrink-0 h-11 w-11 rounded-full transition-all duration-300',
                            'shadow-lg shadow-primary/30 tap-feedback',
                            value.trim() && !disabled && !isLoading
                                ? 'scale-100 opacity-100'
                                : 'scale-90 opacity-50'
                        )}
                        aria-label="Send message"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Slash Command Hint */}
                {value.startsWith('/') && (
                    <p className="text-xs text-muted-foreground mt-2 px-2 animate-slide-in-up">
                        💡 Slash commands: /clear, /help, /tip
                    </p>
                )}
            </div>
        </div>
    );
}
