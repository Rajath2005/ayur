import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Sparkles, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Conversation } from "@shared/schema";

export default function Dashboard() {
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const stats = [
    {
      title: "Total Conversations",
      value: conversations.length,
      icon: MessageSquare,
      description: "Chat sessions started",
    },
    {
      title: "AI Insights",
      value: "24/7",
      icon: Sparkles,
      description: "Always available",
    },
    {
      title: "Wellness Score",
      value: "Good",
      icon: TrendingUp,
      description: "Based on your activity",
    },
    {
      title: "Next Steps",
      value: "Chat",
      icon: Calendar,
      description: "Start a new conversation",
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
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome to AyurChat</h1>
                <p className="text-muted-foreground mt-2">
                  Your personalized Ayurvedic wellness companion
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        {stat.value}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Get Started</CardTitle>
                  <CardDescription>
                    Explore what AyurChat can do for your wellness journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="p-4 rounded-lg border bg-card hover-elevate transition-all">
                      <Sparkles className="h-8 w-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-2">Symptom Analysis</h3>
                      <p className="text-sm text-muted-foreground">
                        Describe your symptoms and get Ayurvedic insights powered by AI
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card hover-elevate transition-all">
                      <MessageSquare className="h-8 w-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-2">Herbal Remedies</h3>
                      <p className="text-sm text-muted-foreground">
                        Discover natural remedies tailored to your constitution
                      </p>
                    </div>
                    <div className="p-4 rounded-lg border bg-card hover-elevate transition-all">
                      <Calendar className="h-8 w-8 text-primary mb-3" />
                      <h3 className="font-semibold mb-2">Expert Consultations</h3>
                      <p className="text-sm text-muted-foreground">
                        Book appointments with certified Ayurvedic practitioners
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {conversations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest conversations and wellness insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {conversations.slice(0, 5).map((conversation) => (
                        <div
                          key={conversation.id}
                          className="flex items-center gap-4 p-3 rounded-lg border hover-elevate transition-all"
                        >
                          <MessageSquare className="h-5 w-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{conversation.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(conversation.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
