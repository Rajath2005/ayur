import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, MessageSquare, Trash2, Leaf, LogOut, Edit3 } from "lucide-react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { CreditsDisplay } from "@/components/credits-display";


export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

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

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not log out",
        variant: "destructive",
      });
    }
  };

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
    <Sidebar className="relative z-40">
      <SidebarHeader className="p-3 sm:p-4 border-b">
        <Link href="/dashboard">
          <div className="flex items-center gap-2 hover-elevate rounded-lg p-2 -m-2 transition-all">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg font-semibold">AyurChat</span>
            <div className="ml-auto">
              <CreditsDisplay compact />
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-2">
            <Button
              className="w-full gap-2"
              onClick={() => createConversationMutation.mutate()}
              disabled={createConversationMutation.isPending}
              data-testid="button-new-chat"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        </SidebarGroup>

        <SidebarGroup className="flex-1">
          <SidebarGroupLabel className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Recent Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-full px-2">
              <SidebarMenu className="space-y-1">
                {isLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground animate-pulse">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-muted"></div>
                      Loading conversations...
                    </div>
                  </div>
                ) : !user ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Sign in to see your conversations
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>No conversations yet</p>
                    <p className="mt-2 text-xs">Click "New Chat" to get started</p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const isActive = location === `/chat/${conversation.id}`;
                    const isEditing = editingId === conversation.id;

                    return (
                      <SidebarMenuItem key={conversation.id}>
                        <div className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-all hover:bg-muted/50 ${isActive ? 'bg-primary/10 border border-primary/20' : ''
                          }`}>
                          <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                          {isEditing ? (
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
                              onBlur={handleSaveRename}
                              className="flex-1 bg-transparent text-sm px-1 border-b border-primary/50 focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <Link href={`/chat/${conversation.id}`} className="flex-1 min-w-0">
                              <span className="text-sm truncate block">{conversation.title}</span>
                            </Link>
                          )}

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(conversation);
                              }}
                              data-testid={`button-rename-${conversation.id}`}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversationMutation.mutate(conversation.id);
                              }}
                              data-testid={`button-delete-${conversation.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
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

      <SidebarFooter className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:text-red-800 dark:bg-red-950 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900 dark:hover:text-red-200 shadow-sm"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}