import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TypingIndicator() {
    return (
        <div className="flex gap-3 justify-start animate-fade-in">
            <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className="bg-green-600 text-white text-xs">🌿</AvatarFallback>
            </Avatar>
            <div className="relative max-w-[75%]">
                <div className="rounded-3xl px-6 py-4 bg-muted border shadow-sm">
                    <div className="flex gap-1.5 items-center">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-dot" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-dot" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-dot" style={{ animationDelay: '300ms' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
