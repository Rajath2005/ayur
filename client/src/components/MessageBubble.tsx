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
            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} ${animationClass}`}
            data-testid={`message-${message.role}-${message.id}`}
        >
            {!isUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="bg-green-600 text-white text-xs">🌿</AvatarFallback>
                </Avatar>
            )}

            <div className="group relative max-w-[75%] flex flex-col">
                <div
                    className={`rounded-3xl px-4 py-3 break-words shadow-sm transition-all duration-200 ${isUser
                            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground"
                            : "bg-muted border hover:shadow-md"
                        }`}
                >
                    {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content || "*Thinking...*"}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 mt-1 px-2">
                    <span className="text-xs text-muted-foreground">
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
                    role={message.role}
                    content={message.content}
                    onCopy={() => onCopy(message.content)}
                    onRegenerate={isUser && onRegenerate ? () => onRegenerate(message.content) : undefined}
                    onEdit={isUser && onEdit ? () => onEdit(message.id) : undefined}
                    onDelete={onDelete ? () => onDelete(message.id) : undefined}
                />
            </div>

            {isUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                    {user?.avatar ? (
                        <AvatarImage src={user.avatar} alt={user?.name || "User"} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
