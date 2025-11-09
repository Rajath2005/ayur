import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, MessageSquare, Trash2, Leaf, LogOut, Sparkles, Pill, Calendar } from "lucide-react";
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

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { logout } = useAuth();

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const createConversationMutation = useMutation<Conversation, Error, void>({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/conversations", {
        title: "New Conversation",
      });
      return result.json();
    },
    onSuccess: (newConversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setLocation(`/chat/${newConversation.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create conversation",
        variant: "destructive",
      });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/conversations/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setLocation("/dashboard");
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed",
        variant: "destructive",
      });
    },
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

  const quickActions = [
    {
      title: "Symptom Check",
      icon: Sparkles,
      action: () => {
        createConversationMutation.mutate();
      },
      testId: "button-symptom-check",
    },
    {
      title: "Herbal Remedies",
      icon: Pill,
      action: () => {
        createConversationMutation.mutate();
      },
      testId: "button-remedies",
    },
    {
      title: "Book Appointment",
      icon: Calendar,
      action: () => {
        createConversationMutation.mutate();
      },
      testId: "button-appointment",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link href="/dashboard">
          <div className="flex items-center gap-2 hover-elevate rounded-lg p-2 -m-2 transition-all">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">AyurChat</span>
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

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-1 gap-2 px-4">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={action.action}
                  data-testid={action.testId}
                >
                  <action.icon className="h-4 w-4" />
                  {action.title}
                </Button>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-[400px]">
              <SidebarMenu>
                {isLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No conversations yet
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <SidebarMenuItem key={conversation.id}>
                      <div className="group flex items-center gap-2 px-4">
                        <SidebarMenuButton
                          asChild
                          isActive={location === `/chat/${conversation.id}`}
                          className="flex-1"
                        >
                          <Link href={`/chat/${conversation.id}`}>
                            <MessageSquare className="h-4 w-4" />
                            <span className="truncate">{conversation.title}</span>
                          </Link>
                        </SidebarMenuButton>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversationMutation.mutate(conversation.id);
                          }}
                          data-testid={`button-delete-${conversation.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t bg-muted/30">
        <Button
          variant="destructive"
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
