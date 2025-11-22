import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Loader2, Edit2, MessageSquare, Clock, Coins } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserDashboard } from "@/components/user-dashboard";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ScrollToBottom } from "@/components/ScrollToBottom";
import { ConversationToolbar } from "@/components/ConversationToolbar";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSlashCommands } from "@/hooks/useSlashCommands";
import { apiRequest } from "@/lib/queryClient";
import type { Message, Conversation } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCredits } from "@/hooks/useCredits";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import "../chat-animations.css";

export default function ChatPage() {
  const [, params] = useRoute("/chat/:id");
  const conversationId = params?.id || "";
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [outOfCreditsModalOpen, setOutOfCreditsModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { credits, refreshCredits, maxCredits } = useCredits();

  const quickSuggestions = [
    "What's my dosha type?",
    "Natural remedies for stress",
    "Ayurvedic diet tips",
    "Morning routine suggestions",
    "Herbs for better sleep"
  ];

  // Slash commands
  const { processCommand, getRandomTip } = useSlashCommands({
    onClear: () => {
      if (confirm("Are you sure you want to clear this conversation?")) {
        // Clear messages logic would go here
        toast({ title: "Conversation cleared" });
      }
    },
    onHelp: () => {
      toast({
        title: "Available Commands",
        description: "/clear - Clear conversation\n/help - Show this help\n/tip - Get Ayurvedic tip",
      });
    },
    onTip: () => {
      const tip = getRandomTip();
      toast({
        title: "🌿 Ayurvedic Tip",
        description: tip,
        duration: 6000,
      });
    },
  });

  const { data: conversation } = useQuery<Conversation | null>({
    queryKey: ["conversations", conversationId],
    queryFn: async () => {
      const res = await apiRequest(`GET`, `/api/conversations/${conversationId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!conversationId,
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await apiRequest(`GET`, `/api/conversations/${conversationId}/messages`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!conversationId,
    staleTime: 0,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      const res = await apiRequest("POST", "/api/chat", {
        conversationId,
        content,
        userMessageId,
        assistantMessageId
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.error === "NO_CREDITS") {
          setOutOfCreditsModalOpen(true);
        }
        throw new Error(error.message || "Failed to send message");
      }

      const result = await res.json();
      return { userMessageId, assistantMessageId, credits: result.credits };
    },
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });

      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      const userMessage: Message = {
        id: userMessageId,
        conversationId,
        role: "user",
        content,
        attachments: null,
        createdAt: new Date(),
      };

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        conversationId,
        role: "assistant",
        content: "",
        attachments: null,
        createdAt: new Date(),
      };

      queryClient.setQueryData(["messages", conversationId], (old: Message[] = []) => [
        ...old,
        userMessage,
        assistantMessage,
      ]);

      setMessage("");
      setIsTyping(true);

      const previousMessages = queryClient.getQueryData<Message[]>(["messages", conversationId]) || [];
      return { previousMessages, userMessageId, assistantMessageId };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setIsTyping(false);

      if (data.credits !== undefined) {
        queryClient.setQueryData(["user", "credits", user?.id], (old: any) => ({
          ...old,
          remainingCredits: data.credits,
        }));

        // Trigger credit deduction animation
        const creditElement = document.querySelector('[data-credit-display]');
        if (creditElement) {
          creditElement.classList.add('animate-spark');
          setTimeout(() => creditElement.classList.remove('animate-spark'), 600);
        }
      }

      const checkMessageInterval = setInterval(async () => {
        const res = await apiRequest(`GET`, `/api/conversations/${conversationId}/messages`);
        if (res.ok) {
          const messages = await res.json();
          const assistantMessage = messages.find((m: Message) => m.id === data.assistantMessageId);
          if (assistantMessage?.content) {
            clearInterval(checkMessageInterval);
            queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
          }
        }
      }, 1000);

      setTimeout(() => clearInterval(checkMessageInterval), 30000);

      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    },
    onError: (error: Error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error.message || "Could not send message",
        variant: "destructive",
      });

      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
    },
  });

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  };

  const regenerateMessage = (messageContent: string) => {
    sendMessageMutation.mutate(messageContent);
  };

  const exportConversation = () => {
    const content = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ayur-chat-${conversation?.title || 'conversation'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Conversation exported" });
  };

  const printConversation = () => {
    window.print();
    toast({ title: "Opening print dialog..." });
  };

  const handleTitleEdit = async () => {
    if (!editedTitle.trim() || editedTitle === conversation?.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const res = await apiRequest("PATCH", `/api/conversations/${conversationId}`, {
        title: editedTitle.trim(),
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ["conversations", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        toast({ title: "Conversation renamed" });
      }
    } catch (error) {
      toast({ title: "Failed to rename", variant: "destructive" });
    }
    setIsEditingTitle(false);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  useEffect(() => {
    if (conversation?.title) {
      setEditedTitle(conversation.title);
    }
  }, [conversation?.title]);

  const handleSend = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;

    // Check for slash commands
    const { isCommand, shouldClear } = processCommand(message);
    if (isCommand) {
      if (shouldClear) setMessage("");
      return;
    }

    if ((credits ?? 0) <= 0) {
      setOutOfCreditsModalOpen(true);
      toast({
        title: "Out of credits",
        description: "You have no credits left.",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  const lastUpdated = conversation?.updatedAt
    ? formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })
    : null;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex-1">
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onBlur={handleTitleEdit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleEdit();
                        if (e.key === 'Escape') setIsEditingTitle(false);
                      }}
                      className="h-8 max-w-md"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2
                      className="font-semibold cursor-pointer hover:text-primary transition-colors"
                      data-testid="text-conversation-title"
                      onClick={() => setIsEditingTitle(true)}
                    >
                      {conversation?.title || "New Conversation"}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingTitle(true)}
                      className="h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {lastUpdated && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lastUpdated}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {messages.length} messages
                  </span>
                  <span className="flex items-center gap-1" data-credit-display>
                    <Coins className="h-3 w-3" />
                    {credits}/{maxCredits} credits
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">

              <ThemeToggle />
            </div>
          </header>
          <UserDashboard open={isUserDashboardOpen} onOpenChange={setIsUserDashboardOpen} />

          {/* Conversation Toolbar */}
          <ConversationToolbar
            onExport={exportConversation}
            onClear={() => {
              if (confirm("Clear all messages?")) {
                toast({ title: "Feature coming soon" });
              }
            }}
            onPrint={printConversation}
            disabled={messages.length === 0}
          />

          {/* Messages Area */}
          <ScrollArea className="flex-1 smooth-scroll" ref={scrollRef}>
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 animate-fade-in">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start Your Wellness Journey</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Ask me anything about Ayurvedic practices, natural remedies, or your health concerns.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                    {quickSuggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant="secondary"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                        onClick={() => setMessage(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      user={user ?? undefined}
                      onCopy={copyMessage}
                      onRegenerate={regenerateMessage}
                      status={msg.id.startsWith('user-') && sendMessageMutation.isPending ? 'sending' : 'delivered'}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Scroll to Bottom Button */}
          <ScrollToBottom scrollRef={scrollRef} />

          {/* Input Area */}
          <div className="border-t p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Ask me about Ayurvedic wellness... (Try /help for commands)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="resize-none min-h-[44px] max-h-[120px] rounded-2xl border-2 focus:border-primary placeholder-animate transition-all"
                    rows={1}
                    data-testid="input-message"
                    disabled={sendMessageMutation.isPending}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMessageMutation.isPending || (credits ?? 0) <= 0}
                  size="icon"
                  className="h-11 w-11 rounded-full transition-all duration-300 hover:scale-105"
                  data-testid="button-send"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {message.startsWith('/') && (
                <p className="text-xs text-muted-foreground mt-2 px-2">
                  💡 Slash commands: /clear, /help, /tip
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Out of Credits Modal */}
      <Dialog open={outOfCreditsModalOpen} onOpenChange={setOutOfCreditsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Out of Credits</DialogTitle>
            <DialogDescription>
              You have run out of credits. Please contact support to get more credits or wait for your monthly reset.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
