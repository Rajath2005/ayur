import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface MessageReactionsProps {
    messageId: string;
    reactions?: { emoji: string; count: number; userReacted: boolean }[];
    onReact?: (emoji: string) => void;
}

const REACTION_EMOJIS = ["👍", "❤️", "🌿", "😊", "🔄"];

export function MessageReactions({
    messageId,
    reactions = [],
    onReact,
}: MessageReactionsProps) {
    const [open, setOpen] = useState(false);

    const handleReact = (emoji: string) => {
        onReact?.(emoji);
        setOpen(false);
    };

    return (
        <div className="flex items-center gap-1 mt-1">
            {reactions.length > 0 && (
                <div className="flex gap-1">
                    {reactions.map((reaction, idx) => (
                        <button
                            key={`${messageId}-${reaction.emoji}-${idx}`}
                            onClick={() => handleReact(reaction.emoji)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all duration-200 ${reaction.userReacted
                                    ? "bg-primary/20 border border-primary/40 hover:bg-primary/30"
                                    : "bg-muted hover:bg-accent border border-transparent"
                                }`}
                        >
                            <span>{reaction.emoji}</span>
                            {reaction.count > 1 && (
                                <span className="text-[10px] font-medium">{reaction.count}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Smile className="h-3.5 w-3.5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                    <div className="flex gap-1">
                        {REACTION_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleReact(emoji)}
                                className="text-xl hover:scale-125 transition-transform duration-200 p-1 rounded hover:bg-accent"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
