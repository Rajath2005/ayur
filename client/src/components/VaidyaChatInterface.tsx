import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Stethoscope, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ScrollToBottom } from "@/components/ScrollToBottom";
import type { Message } from "@shared/schema";
import type { AuthUser } from "@/services/auth";
import { cn } from "@/lib/utils";

interface VaidyaChatInterfaceProps {
    messages: Message[];
    user: AuthUser | null;
    onSendMessage: (content: string) => void;
    isTyping: boolean;
    isSending: boolean;
    credits: number;
}

export function VaidyaChatInterface({
    messages,
    user,
    onSendMessage,
    isTyping,
    isSending,
    credits
}: VaidyaChatInterfaceProps) {
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Calculate progress based on message count (heuristic for now)
    // Assuming a typical diagnostic session might have ~10-15 exchanges
    const progress = Math.min((messages.length / 20) * 100, 95);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!input.trim() || isSending) return;
        onSendMessage(input.trim());
        setInput("");
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
            {/* Diagnostic Header */}
            <div className="bg-background border-b px-3 md:px-6 py-3 md:py-4 flex items-center justify-between sticky top-0 z-10 pt-safe-top">
                <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                        <Stethoscope className="h-4 w-4 md:h-5 md:w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-semibold text-base md:text-lg truncate">Vaidya Diagnostic</h2>
                        <div className="flex items-center gap-1 md:gap-2 text-xs text-muted-foreground">
                            <span className="hidden sm:flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Medical History
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                {credits} credits
                            </span>
                        </div>
                    </div>
                </div>
                <div className="w-24 md:w-32 hidden sm:block flex-shrink-0">
                    <div className="flex justify-between text-xs mb-1 text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="max-w-3xl mx-auto space-y-6 py-4">
                    {messages.length === 0 && (
                        <Card className="p-6 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50">
                            <div className="flex gap-4">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <Stethoscope className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-100">
                                        Namaste, I am your AI Vaidya.
                                    </h3>
                                    <p className="text-indigo-800/80 dark:text-indigo-200/80 leading-relaxed">
                                        I will ask you a series of questions to understand your Prakriti (body constitution)
                                        and Vikriti (current imbalance). Please answer as honestly as possible for an accurate diagnosis.
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-indigo-700 dark:text-indigo-300 mt-4">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Confidential</span>
                                        <span className="mx-2">•</span>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Ayurvedic Analysis</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            user={user ?? undefined}
                            onCopy={handleCopy}
                            status={msg.id.startsWith('user-') && isSending ? 'sending' : 'delivered'}
                            className={cn(
                                msg.role === 'assistant' && "border-indigo-100 bg-indigo-50/30 dark:border-indigo-900/30 dark:bg-indigo-950/10"
                            )}
                        />
                    ))}

                    {isTyping && <TypingIndicator />}
                </div>
            </ScrollArea>

            <ScrollToBottom scrollRef={scrollRef} />

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-background border-t pb-safe-bottom">
                <div className="max-w-3xl mx-auto flex items-end gap-2 md:gap-3">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your answer..."
                        className="min-h-[44px] md:min-h-[50px] max-h-[120px] md:max-h-[150px] resize-none rounded-2xl border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400/20 dark:border-indigo-800 text-base py-3 px-4"
                        disabled={isSending}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || isSending}
                        size="icon"
                        className="h-11 w-11 md:h-12 md:w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 flex-shrink-0"
                    >
                        {isSending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-2">
                    1 credit per response
                </p>
            </div>
        </div>
    );
}
