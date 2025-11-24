import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageSquare, Camera, ArrowRight, Clock, Sparkles, Stethoscope, Eye, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from 'uuid';

import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Conversation } from "@shared/schema";
import "../dashboard-premium.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedMode, setSelectedMode] = useState<'GYAAN' | 'VAIDYA' | 'DRISHTI' | null>(null);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const startModeMutation = useMutation({
    mutationFn: async (mode: 'GYAAN' | 'VAIDYA' | 'DRISHTI') => {
      const clientRequestId = uuidv4();

      if (mode === 'DRISHTI') {
        return { mode, conversationId: 'new-drishti' };
      }

      const res = await apiRequest("POST", "/api/mode/start", {
        mode,
        clientRequestId
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || error.error || "Failed to start mode");
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      if (data.mode === 'DRISHTI') {
        setLocation(`/drishti-upload`);
      } else {
        setLocation(`/chat/${data.conversationId}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error starting mode",
        description: error.message,
        variant: "destructive",
      });
      setSelectedMode(null);
    }
  });

  const handleModeSelect = (mode: 'GYAAN' | 'VAIDYA' | 'DRISHTI') => {
    setSelectedMode(mode);
    startModeMutation.mutate(mode);
  };

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
              <ThemeToggle />
            </div>
          </header>
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

              {/* Primary CTA Section */}
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">Select how you want to interact with Ayurveda today</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card A: Ayurveda Gyaan */}
                  <Card
                    className={`cursor-pointer hover:border-primary transition-all hover:shadow-md card-premium ${selectedMode === 'GYAAN' ? 'border-primary shadow-md' : ''}`}
                    onClick={() => handleModeSelect('GYAAN')}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Ayurveda Gyaan</span>
                      </CardTitle>
                      <CardDescription>General Wellness Chat</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• 1 Credit to start</li>
                        <li>• 1 Credit per response</li>
                        <li>• General queries & tips</li>
                      </ul>
                      <Button
                        className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                        variant="outline"
                        disabled={startModeMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModeSelect('GYAAN');
                        }}
                      >
                        {startModeMutation.isPending && selectedMode === 'GYAAN' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Start (1 Credit)"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Card B: Vaidya Chat */}
                  <Card
                    className={`cursor-pointer hover:border-primary transition-all hover:shadow-md card-premium border-primary/20 bg-primary/5 ${selectedMode === 'VAIDYA' ? 'border-primary shadow-md' : ''}`}
                    onClick={() => handleModeSelect('VAIDYA')}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Stethoscope className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Vaidya Chat</span>
                      </CardTitle>
                      <CardDescription>Diagnostic Consultation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• 5 Credits to start</li>
                        <li>• Deep diagnostic loop</li>
                        <li>• Personalized report</li>
                      </ul>
                      <Button
                        className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                        variant="outline"
                        disabled={startModeMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModeSelect('VAIDYA');
                        }}
                      >
                        {startModeMutation.isPending && selectedMode === 'VAIDYA' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Start (5 Credits)"
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Card C: Drishti AI */}
                  <Card
                    className={`cursor-pointer hover:border-primary transition-all hover:shadow-md card-premium ${selectedMode === 'DRISHTI' ? 'border-primary shadow-md' : ''}`}
                    onClick={() => handleModeSelect('DRISHTI')}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Eye className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>Drishti AI</span>
                      </CardTitle>
                      <CardDescription>Visual Analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• 10 Credits on upload</li>
                        <li>• Tongue/Face analysis</li>
                        <li>• Visual health report</li>
                      </ul>
                      <Button
                        className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                        variant="outline"
                        disabled={startModeMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModeSelect('DRISHTI');
                        }}
                      >
                        {startModeMutation.isPending && selectedMode === 'DRISHTI' ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Start (10 Credits)"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

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
        </div >
      </div >
    </SidebarProvider >
  );
}
