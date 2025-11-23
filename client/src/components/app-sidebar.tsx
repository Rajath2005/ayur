import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, MessageSquare, Trash2, Leaf, Edit3, Check, X } from "lucide-react";
import { useState } from "react";
import { ProfilePopover } from "@/components/profile-popover";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { CreditsDisplay } from "@/components/credits-display";


import { ModeSelectionModal } from "@/components/ModeSelectionModal";

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isModeModalOpen, setIsModeModalOpen] = useState(false);

  const { credits, maxCredits, refreshCredits } = useCredits();

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    enabled: !!user?.id,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0 // Always fetch fresh data
  });

  const createConversationMutation = useMutation<{ conversation: Conversation; credits: number; success?: boolean }, Error, void>({
    mutationFn: async () => {
      console.log("🔵 [createConversation] Sending request...");
      const result = await apiRequest("POST", "/api/conversations", {
        title: "New Conversation",
      });
      const data = await result.json();
      console.log("🟢 [createConversation] Response received:", data);

      if (!result.ok) {
        throw new Error(data.message || data.error || "Failed to create conversation");
      }

      // Handle both new structured format and potential legacy flat format
      if (data.success && data.conversation) {
        return data;
      } else if (data.id) {
        // Legacy fallback
        return { conversation: data, credits: data.credits, success: true };
      }

      throw new Error("Invalid response format from server");
    },
    onSuccess: (data) => {
      console.log("✨ [createConversation] Success handler triggered", data);
      const { conversation, credits } = data;

      if (!conversation || !conversation.id) {
        console.error("❌ [createConversation] Missing conversation ID in response", data);
        toast({
          title: "Error",
          description: "Conversation created but ID missing",
          variant: "destructive",
        });
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      // Update credits in cache immediately with the returned value
      queryClient.setQueryData(["user", "credits", user?.id], (old: any) => ({
        ...old,
        remainingCredits: credits,
      }));

      console.log(`🚀 [createConversation] Navigating to /chat/${conversation.id}`);
      setLocation(`/chat/${conversation.id}`);
      setOpenMobile(false); // Close mobile menu after creating conversation
    },
    onError: (error: any) => {
      console.error("💥 [createConversation] Error handler triggered", error);
      if (error.message?.includes("NO_CREDITS") || error.error === "NO_CREDITS") {
        toast({
          title: "Out of credits",
          description: "You need more credits to start a new conversation.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Could not create conversation",
          variant: "destructive",
        });
      }
    },
  });

  const updateConversationMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await apiRequest("PUT", `/api/conversations/${id}`, { title });
      if (!res.ok) throw new Error("Rename failed");
      return { id, title };
    },
    onMutate: async ({ id, title }) => {
      // Optimistically update UI
      await queryClient.cancelQueries({ queryKey: ["conversations"] });
      const prev = queryClient.getQueryData<Conversation[]>(["conversations"]);
      if (prev) {
        queryClient.setQueryData(["conversations"], prev.map(c => c.id === id ? { ...c, title } : c));
      }
      return { prev };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setEditingId(null);
      setEditTitle("");
      toast({
        title: "Conversation renamed",
        description: "The conversation title has been updated",
        variant: "success",
      });
    },
    onError: (_err, _vars, ctx) => {
      // Rollback optimistic update
      if (ctx?.prev) {
        queryClient.setQueryData(["conversations"], ctx.prev);
      }
      toast({
        title: "Error",
        description: "Could not rename conversation",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setLocation("/dashboard");
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed",
        variant: "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not delete conversation",
        variant: "destructive",
      });
    }
  });



  const handleRename = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveRename = () => {
    if (!editingId) {
      handleCancelRename();
      return;
    }

    const newTitle = editTitle.trim();
    if (!newTitle) {
      handleCancelRename();
      return;
    }

    console.log('Saving rename:', { id: editingId, title: newTitle });
    updateConversationMutation.mutate({ id: editingId, title: newTitle });
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <>
      <ModeSelectionModal open={isModeModalOpen} onOpenChange={setIsModeModalOpen} />

      <Sidebar collapsible="offcanvas">
        {/* Enhanced Header with Gradient Background */}
        <SidebarHeader className="p-4 sm:p-5 border-b border-sidebar-border/50 bg-gradient-to-br from-primary/5 via-transparent to-primary/5">
          <Link href="/dashboard" onClick={() => setOpenMobile(false)}>
            <div className="flex items-center gap-3 hover-elevate rounded-xl p-3 -m-3 transition-all duration-200 hover:shadow-md group">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-200">
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary drop-shadow-sm" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                AyurChat
              </span>
              <div className="ml-auto">
                <CreditsDisplay compact />
              </div>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="py-2">
          {/* New Chat Button with Enhanced Styling */}
          <SidebarGroup>
            <div className="px-3 py-3">
              <Button
                className="w-full gap-2 h-11 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                onClick={() => setIsModeModalOpen(true)}
                disabled={createConversationMutation.isPending}
                data-testid="button-new-chat"
              >
                <Plus className="h-5 w-5" />
                <span className="text-sm">New Chat</span>
              </Button>
            </div>
          </SidebarGroup>

          {/* Conversations List with Enhanced Styling */}
          <SidebarGroup className="flex-1 mt-2">
            <SidebarGroupLabel className="px-5 py-2 text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
              Recent Conversations
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <ScrollArea className="h-full px-2">
                <SidebarMenu className="space-y-1.5 py-2">
                  {isLoading ? (
                    <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                      <div className="inline-flex flex-col items-center gap-3 animate-in fade-in duration-500">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse"></div>
                        <span className="font-medium">Loading conversations...</span>
                      </div>
                    </div>
                  ) : !user ? (
                    <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                      <div className="inline-flex flex-col items-center gap-2">
                        <Leaf className="h-8 w-8 text-muted-foreground/40" />
                        <span>Sign in to see your conversations</span>
                      </div>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
                          <MessageSquare className="h-8 w-8 text-primary/60" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground/70">No conversations yet</p>
                          <p className="mt-1.5 text-xs text-muted-foreground/70">Click "New Chat" to get started</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    conversations.map((conversation, index) => {
                      const isActive = location === `/chat/${conversation.id}`;
                      const isEditing = editingId === conversation.id;

                      return (
                        <SidebarMenuItem
                          key={conversation.id}
                          className="animate-in slide-in-from-left duration-300"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div
                            className={`
                              group relative flex items-center gap-3 px-3 py-3 rounded-xl
                              transition-all duration-200
                              hover:bg-gradient-to-r hover:from-muted/60 hover:to-muted/40
                              hover:shadow-sm hover:scale-[1.01]
                              ${isActive
                                ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 border-l-2 border-primary shadow-sm ring-1 ring-primary/20'
                                : 'hover:border-l-2 hover:border-primary/30'
                              }
                            `}
                          >
                            {/* Icon with gradient background */}
                            <div className={`
                              p-1.5 rounded-lg transition-all duration-200
                              ${isActive
                                ? 'bg-gradient-to-br from-primary/25 to-primary/15'
                                : 'bg-muted/50 group-hover:bg-muted'
                              }
                            `}>
                              <MessageSquare className={`h-4 w-4 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>

                            {/* Title or Edit Input */}
                            {isEditing ? (
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveRename();
                                    }
                                    if (e.key === 'Escape') {
                                      e.preventDefault();
                                      handleCancelRename();
                                    }
                                  }}
                                  className="flex-1 bg-background/50 text-sm px-2 py-1 rounded-lg border-2 border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                  autoFocus
                                />
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg hover:bg-primary/20 hover:text-primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveRename();
                                    }}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg hover:bg-destructive/20 hover:text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCancelRename();
                                    }}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <Link
                                href={`/chat/${conversation.id}`}
                                className="flex-1 min-w-0"
                                onClick={() => setOpenMobile(false)}
                              >
                                <span className={`text-sm truncate block font-medium transition-colors ${isActive ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground'}`}>
                                  {conversation.title}
                                </span>
                              </Link>
                            )}

                            {/* Action Buttons */}
                            {!isEditing && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg hover:bg-primary/20 hover:text-primary transition-all duration-200 hover:scale-110"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRename(conversation);
                                  }}
                                  data-testid={`button-rename-${conversation.id}`}
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all duration-200 hover:scale-110"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteConversationMutation.mutate(conversation.id);
                                  }}
                                  data-testid={`button-delete-${conversation.id}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </SidebarMenuItem>
                      );
                    })
                  )}
                </SidebarMenu>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Enhanced Footer with Profile Popover */}
        <SidebarFooter className="p-4 border-t border-sidebar-border/50 bg-gradient-to-t from-sidebar/50 to-transparent">
          <ProfilePopover />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}