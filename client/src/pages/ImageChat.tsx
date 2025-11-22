import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Loader2, Copy, RotateCcw, Download, Upload, X } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserDashboard } from "@/components/user-dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Message, Conversation } from "@shared/schema";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCredits } from "@/hooks/useCredits";
import { ImageDropZone } from "@/components/ImageDropZone";
import { ImageMessageBubble } from "@/components/ImageMessageBubble";

export default function ImageChatPage() {
  const [, params] = useRoute("/image-chat/:id");
  const conversationId = params?.id || "";
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [outOfCreditsModalOpen, setOutOfCreditsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { credits, refreshCredits } = useCredits();

  const quickSuggestions = [
    "Analyze this image for Ayurvedic insights",
    "What herbs are visible here?",
    "Identify the dosha balance in this food",
    "Check for natural remedies in this plant"
  ];

  const { data: conversation } = useQuery<Conversation | null>({
    queryKey: ["imageChatSessions", conversationId],
    queryFn: async () => {
      const res = await apiRequest(`GET`, `/api/image-chat-sessions/${conversationId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!conversationId,
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["imageMessages", conversationId],
    queryFn: async () => {
      const res = await apiRequest(`GET`, `/api/image-chat-sessions/${conversationId}/messages`);
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

      const formData = new FormData();
      formData.append('conversationId', conversationId);
      formData.append('content', content);
      formData.append('userMessageId', userMessageId);
      formData.append('assistantMessageId', assistantMessageId);
      if (uploadedImage) {
        formData.append('image', uploadedImage);
      }

      const res = await fetch('/api/image-chat', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.error === "NO_CREDITS") {
          setOutOfCreditsModalOpen(true);
        }
        throw new Error(error.message || "Failed to send message");
      }

      const result = await res.json();
      // Return IDs and credits for tracking
      return { userMessageId, assistantMessageId, credits: result.credits };
    },
    onMutate: async (content: string) => {
      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `assistant-${Date.now()}`;

      const userMessage: Message = {
        id: userMessageId,
        conversationId,
        role: "user",
        content,
        attachments: uploadedImage ? [{ type: 'image', url: imagePreview }] : null,
        createdAt: new Date(),
      };

      const assistantMessage: Message = {
        id: assistantMessageId,
        conversationId,
        role: "assistant",
        content: "",
        attachments: null,
        createdAt: new Date(),
      };

      queryClient.setQueryData(["imageMessages", conversationId], (old: Message[] = []) => [
        ...old,
        userMessage,
        assistantMessage,
      ]);

      setMessage("");
      setUploadedImage(null);
      setImagePreview(null);
      setIsTyping(true);

      return { userMessageId, assistantMessageId };
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["imageMessages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["imageChatSessions"] });
      setIsTyping(false);

      // Update credits in cache immediately with the returned value
      if (data.credits !== undefined) {
        queryClient.setQueryData(["user", "credits", user?.id], (old: any) => ({
          ...old,
          remainingCredits: data.credits,
        }));
      }

      const checkMessageInterval = setInterval(async () => {
        const res = await apiRequest(`GET`, `/api/image-chat-sessions/${conversationId}/messages`);
        if (res.ok) {
          const messages = await res.json();
          const assistantMessage = messages.find((m: Message) => m.id === data.assistantMessageId);
          if (assistantMessage?.content) {
            clearInterval(checkMessageInterval);
            queryClient.invalidateQueries({ queryKey: ["imageMessages", conversationId] });
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
      queryClient.invalidateQueries({ queryKey: ["imageMessages", conversationId] });
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
    a.download = `ayur-image-chat-${conversation?.title || 'conversation'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
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

  const handleSend = () => {
    if (!message.trim() && !uploadedImage) return;
    if ((credits ?? 0) <= 0) {
      setOutOfCreditsModalOpen(true);
      toast({
        title: "Out of credits",
        description: "You have no credits left.",
        variant: "destructive",
      });
      return;
    }
    sendMessageMutation.mutate(message.trim() || "Analyze this image");
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
                  {conversation?.title || "Image Analysis Chat"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  AI-powered image analysis for Ayurvedic insights
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={exportConversation}
                disabled={messages.length === 0}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>

              <ThemeToggle />
            </div>
          </header>
          <UserDashboard open={isUserDashboardOpen} onOpenChange={setIsUserDashboardOpen} />

          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-6">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Upload an Image for Analysis</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      Upload images of herbs, foods, or wellness-related items for AI-powered Ayurvedic analysis.
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
                  <ImageDropZone onImageUpload={handleImageUpload} />
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${msg.role}-${msg.id}`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-green-600 text-white text-xs">🌿</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="group relative max-w-[75%]">
                      {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 ? (
                        <ImageMessageBubble message={msg} />
                      ) : (
                        <div
                          className={`rounded-2xl px-4 py-3 break-words ${msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted border"
                            }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 left-0 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyMessage(msg.content)}
                          className="h-6 px-2 text-xs"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {msg.role === "user" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => regenerateMessage(msg.content)}
                            className="h-6 px-2 text-xs"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        {user?.avatar ? (
                          <AvatarImage src={user.avatar} alt={user?.name || "User"} />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-32 max-w-32 rounded-lg border shadow-sm"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    ref={textareaRef}
                    placeholder="Describe what you'd like to analyze in this image..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="resize-none min-h-[44px] max-h-[120px] rounded-2xl border-2 focus:border-primary"
                    rows={1}
                    data-testid="input-message"
                    disabled={sendMessageMutation.isPending}
                  />
                </div>
                <Button
                  onClick={handleSend}
                  disabled={(!message.trim() && !uploadedImage) || sendMessageMutation.isPending || (credits ?? 0) <= 0}
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  data-testid="button-send"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
