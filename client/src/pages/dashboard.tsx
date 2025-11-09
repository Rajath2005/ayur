import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageSquare, Camera, User, LogOut, Settings, ChevronDown, ArrowRight, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { UserDashboard } from "@/components/user-dashboard";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
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

  const latestConversation = conversations[0];
  const totalImages = 0;
  const lastActiveDate = latestConversation ? new Date(latestConversation.createdAt).toLocaleDateString() : "Never";

  const stats = [
    {
      title: "Total Chats",
      value: conversations.length,
      icon: MessageSquare,
    },
    {
      title: "Images Analyzed",
      value: totalImages,
      icon: Camera,
    },
    {
      title: "Last Active",
      value: lastActiveDate,
      icon: Clock,
    },
  ];

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
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-3 h-auto p-2 hover:bg-muted/50"
                    data-testid="button-user-profile"
                  >
                    <Avatar className="h-8 w-8">
                      {user?.avatar && (
                        <AvatarImage src={user.avatar} alt={user?.name || user?.email || "User"} />
                      )}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">{user?.name || user?.email}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsUserDashboardOpen(true)}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast({ title: "Settings", description: "Settings coming soon" })}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ThemeToggle />
            </div>
          </header>
          <UserDashboard open={isUserDashboardOpen} onOpenChange={setIsUserDashboardOpen} />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Hero Greeting */}
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Welcome back, {user?.name || 'Friend'}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Your AI-powered Ayurvedic wellness assistant.
                </p>
              </div>

              {/* Primary CTA Card */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-lg font-semibold">How can I help you today?</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        size="lg" 
                        className="flex-1 gap-2 h-12"
                        onClick={() => createConversationMutation.mutate()}
                        disabled={createConversationMutation.isPending}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Start Chat
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="flex-1 gap-2 h-12"
                        onClick={() => createConversationMutation.mutate()}
                        disabled={createConversationMutation.isPending}
                      >
                        <Camera className="h-5 w-5" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity / Continue Chat */}
              <Card>
                <CardContent className="p-6">
                  {latestConversation ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Continue where you left off</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {latestConversation.title}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => setLocation(`/chat/${latestConversation.id}`)}
                      >
                        Resume Chat
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">
                        No conversations yet. Start your first conversation!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardContent className="p-4 text-center">
                      <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                      <div className="text-lg font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        {stat.value}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.title}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Footer Note */}
              <div className="text-center pt-4">
                <p className="text-xs text-muted-foreground">
                  AyurChat provides AI-generated wellness guidance and is not a medical diagnostic tool.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
