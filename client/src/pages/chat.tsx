import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Paperclip, Smile, Mic, Loader2, X } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message, Conversation } from "@shared/schema";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ChatPage() {
  const [, params] = useRoute("/chat/:id");
  const conversationId = params?.id || "";
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: conversation } = useQuery<Conversation>({
    queryKey: ["/api/conversations", conversationId],
    enabled: !!conversationId,
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", conversationId],
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const result = await apiRequest("POST", "/api/chat", {
        conversationId,
        content,
        attachments: attachments.length > 0 ? attachments.map(f => ({ name: f.name, type: f.type, size: f.size })) : undefined,
      });
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessage("");
      setAttachments([]);
      
      // Simulate AI typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not send message",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Recording started",
        description: "Speak your message (simulated)",
      });
      setTimeout(() => {
        setIsRecording(false);
        setMessage("This is a simulated voice message transcription.");
      }, 2000);
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h2 className="font-semibold" data-testid="text-conversation-title">
                  {conversation?.title || "New Conversation"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI-powered Ayurvedic guidance
                </p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-4xl mx-auto space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Smile className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start Your Wellness Journey</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Ask me anything about Ayurvedic practices, natural remedies, or your health concerns.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${msg.role}-${msg.id}`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary">U</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75" />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="max-w-4xl mx-auto">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0"
                        onClick={() => removeAttachment(index)}
                        data-testid={`button-remove-attachment-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="resize-none pr-24"
                    rows={1}
                    data-testid="input-message"
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      data-testid="input-file"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      data-testid="button-attach"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" data-testid="button-emoji">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleRecording}
                      className={isRecording ? "text-destructive" : ""}
                      data-testid="button-mic"
                    >
                      <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={handleSend}
                  disabled={(!message.trim() && attachments.length === 0) || sendMessageMutation.isPending}
                  data-testid="button-send"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
