import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageActions } from "./MessageActions";
import { MessageReactions } from "./MessageReactions";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
    message: Message;
    user?: { id?: string; name?: string; email?: string; avatar?: string };
    onCopy: (content: string) => void;
    onRegenerate?: (content: string) => void;
    onEdit?: (messageId: string) => void;
    onDelete?: (messageId: string) => void;
    onReact?: (messageId: string, emoji: string) => void;
    status?: "sending" | "sent" | "delivered" | "seen";
    reactions?: { emoji: string; count: number; userReacted: boolean }[];
    className?: string;
}

export function MessageBubble({
    message,
    user,
    onCopy,
    onRegenerate,
    onEdit,
    onDelete,
    onReact,
    status,
    reactions,
    className,
}: MessageBubbleProps) {
    const isUser = message.role === "user";
    const animationClass = isUser ? "animate-slide-in-right" : "animate-slide-in-left";

    const getStatusIcon = () => {
        if (!isUser || !status) return null;
        switch (status) {
            case "sending":
                return <span className="text-xs text-muted-foreground ml-2">●●●</span>;
            case "sent":
                return <span className="text-xs text-muted-foreground ml-2">✓</span>;
            case "delivered":
                return <span className="text-xs text-muted-foreground ml-2">✓✓</span>;
            case "seen":
                return <span className="text-xs text-primary ml-2">✓✓</span>;
            default:
                return null;
        }
    };

    return (
        <div
            className={`flex gap-2 md:gap-3 ${isUser ? "justify-end" : "justify-start"} ${animationClass} mb-6 md:mb-4`}
            data-testid={`message-${message.role}-${message.id}`}
        >
            {!isUser && (
                <Avatar className="h-10 w-10 md:h-8 md:w-8 flex-shrink-0 shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-sm md:text-xs">🌿</AvatarFallback>
                </Avatar>
            )}

            <div className="group relative max-w-[85%] md:max-w-[75%] flex flex-col">
                <div
                    className={`rounded-[24px] md:rounded-3xl px-5 md:px-4 py-4 md:py-3 break-words transition-all duration-300 ${isUser
                        ? "bg-gradient-to-br from-primary via-primary to-primary/95 text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-card border border-border/50 shadow-md hover:shadow-lg backdrop-blur-sm"
                        }`}
                >
                    {isUser ? (
                        <p className="text-[15px] md:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="text-[15px] md:text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-3">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content || "*Thinking...*"}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-1.5 px-2">
                    <span className="text-[11px] md:text-xs text-muted-foreground/80">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </span>
                    {getStatusIcon()}
                </div>

                {onReact && (
                    <MessageReactions
                        messageId={message.id}
                        reactions={reactions}
                        onReact={(emoji) => onReact(message.id, emoji)}
                    />
                )}

                <MessageActions
                    role={message.role as "user" | "assistant"}
                    content={message.content}
                    onCopy={() => onCopy(message.content)}
                    onRegenerate={isUser && onRegenerate ? () => onRegenerate(message.content) : undefined}
                    onEdit={isUser && onEdit ? () => onEdit(message.id) : undefined}
                    onDelete={onDelete ? () => onDelete(message.id) : undefined}
                />
            </div>

            {isUser && (
                <Avatar className="h-10 w-10 md:h-8 md:w-8 flex-shrink-0 shadow-sm">
                    {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user?.name || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground text-sm md:text-xs font-medium">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
