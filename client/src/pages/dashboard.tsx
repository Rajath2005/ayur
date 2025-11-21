import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageSquare, Camera, User, LogOut, Settings, ChevronDown, ArrowRight, Clock, Sparkles } from "lucide-react";
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
import "../dashboard-premium.css";

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

  const createImageChatSessionMutation = useMutation<Conversation, Error, void>({
    mutationFn: async () => {
      const result = await apiRequest("POST", "/api/image-chat-sessions", {
        title: "Image Analysis Session",
      });
      return result.json();
    },
    onSuccess: (newSession: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setLocation(`/image-chat/${newSession.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not create image chat session",
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
          <header className="flex items-center justify-between p-4 border-b backdrop-blur-sm bg-background/95">
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
          <main className="flex-1 overflow-auto smooth-scroll">
            <div className="max-w-5xl mx-auto space-y-8 p-6 md:p-8 lg:p-10">
              {/* Hero Greeting with Gradient Background */}
              <div className="relative overflow-hidden rounded-2xl bg-ayur-gradient p-8 md:p-10 animate-fade-in">
                <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
                  <Sparkles className="w-full h-full text-primary" />
                </div>
                <div className="relative z-10">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3">
                    Welcome back, {user?.name || 'Friend'}! 👋
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    Your AI-powered Ayurvedic wellness assistant is here to guide you on your journey to holistic health.
                  </p>
                </div>
              </div>

              {/* Primary CTA Card with Enhanced Styling */}
              <Card className="border-2 border-primary/20 card-premium animate-slide-up">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <h2 className="text-2xl font-semibold tracking-tight">How can I help you today?</h2>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                      <Button
                        size="lg"
                        className="flex-1 gap-2 h-14 text-base btn-glow shadow-md hover:shadow-lg transition-all"
                        onClick={() => createConversationMutation.mutate()}
                        disabled={createConversationMutation.isPending}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Start Chat
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 gap-2 h-14 text-base border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm hover:shadow-md"
                        onClick={() => createImageChatSessionMutation.mutate()}
                        disabled={createImageChatSessionMutation.isPending}
                      >
                        <Camera className="h-5 w-5" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity / Continue Chat */}
              <Card className="card-premium animate-slide-up animate-delay-100">
                <CardContent className="p-6">
                  {latestConversation ? (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">Continue where you left off</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {latestConversation.title}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                        onClick={() => setLocation(`/chat/${latestConversation.id}`)}
                      >
                        Resume Chat
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-base">
                        No conversations yet. Start your first conversation to begin your wellness journey!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Row with Enhanced Design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                  <Card key={stat.title} className={`card-premium animate-slide-up animate-delay-${(index + 1) * 100}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-full icon-bg-gradient flex items-center justify-center">
                          <stat.icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-3xl font-bold tracking-tight" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                            {stat.value}
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">
                            {stat.title}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Footer Note */}
              <div className="text-center pt-6 pb-4 animate-fade-in">
                <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  AyurChat provides AI-generated wellness guidance based on Ayurvedic principles and is not a substitute for professional medical advice, diagnosis, or treatment.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
