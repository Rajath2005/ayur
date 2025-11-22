import { useQuery } from "@tanstack/react-query";
import { Zap, TrendingUp, Calendar, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

interface CreditsDetails {
    remainingCredits: number;
    maxCredits: number;
    usedCredits: number;
    cycleStart: Date;
    cycleEnd: Date;
    resetInDays: number;
    usageHistory: Array<{
        id: string;
        type: string;
        amount: number;
        timestamp: Date;
    }>;
    plan: string;
}

export default function SubscriptionPage() {
    const { user } = useAuth();

    const { data: creditsData, isLoading } = useQuery<CreditsDetails>({
        queryKey: ["credits-details"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/users/me/credits/details");
            if (!response.ok) throw new Error("Failed to fetch credits");
            return response.json();
        },
        enabled: !!user?.id,
    });

    const percent = creditsData
        ? (creditsData.remainingCredits / creditsData.maxCredits) * 100
        : 0;

    const sidebarStyle = {
        "--sidebar-width": "20rem",
        "--sidebar-width-icon": "4rem",
    } as React.CSSProperties;

    return (
        <SidebarProvider style={sidebarStyle}>
            <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                    <main className="flex-1 overflow-auto p-6 md:p-8 lg:p-10">
                        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                            {/* Header */}
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                                    Subscription & Credits
                                </h1>
                                <p className="text-muted-foreground">
                                    Manage your credits and subscription plan
                                </p>
                            </div>

                            {isLoading ? (
                                <Card className="p-12 text-center">
                                    <div className="inline-flex flex-col items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse" />
                                        <span className="text-sm text-muted-foreground">Loading credits...</span>
                                    </div>
                                </Card>
                            ) : (
                                <>
                                    {/* Credits Overview */}
                                    <Card className="card-premium animate-slide-up">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-primary" />
                                                Monthly Credits
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <div className="text-4xl font-bold">
                                                        {creditsData?.remainingCredits}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        of {creditsData?.maxCredits} remaining
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-semibold text-muted-foreground">
                                                        {creditsData?.usedCredits}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">used</p>
                                                </div>
                                            </div>

                                            <Progress
                                                value={percent}
                                                className={`h-3 ${(creditsData?.remainingCredits || 0) < 5 ? "bg-destructive/20" : ""
                                                    }`}
                                            />

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    Resets{" "}
                                                    {creditsData?.cycleEnd
                                                        ? formatDistanceToNow(new Date(creditsData.cycleEnd), {
                                                            addSuffix: true,
                                                        })
                                                        : "in 15 days"}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Usage History */}
                                    <Card className="card-premium animate-slide-up animate-delay-100">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-primary" />
                                                Recent Usage
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {creditsData?.usageHistory && creditsData.usageHistory.length > 0 ? (
                                                <div className="space-y-3">
                                                    {creditsData.usageHistory.map((log) => (
                                                        <div
                                                            key={log.id}
                                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                                                        >
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {log.type.replace(/_/g, " ")}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {new Date(log.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-destructive">-{log.amount}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-center text-sm text-muted-foreground py-8">
                                                    No usage history yet
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Plans */}
                                    <div className="grid md:grid-cols-2 gap-6 animate-slide-up animate-delay-200">
                                        {/* Free Plan */}
                                        <Card className={`card-premium ${creditsData?.plan === 'free' ? 'border-primary border-2' : ''}`}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    Free Plan
                                                    {creditsData?.plan === 'free' && (
                                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <div className="text-3xl font-bold">40</div>
                                                    <p className="text-sm text-muted-foreground">credits per month</p>
                                                </div>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        Basic AI consultations
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        Monthly credit reset
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        Community support
                                                    </li>
                                                </ul>
                                            </CardContent>
                                        </Card>

                                        {/* Pro Plan */}
                                        <Card className="card-premium border-primary/50">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Crown className="h-5 w-5 text-amber-500" />
                                                    Pro Plan
                                                    <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full">
                                                        Coming Soon
                                                    </span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <div className="text-3xl font-bold">200</div>
                                                    <p className="text-sm text-muted-foreground">credits per month</p>
                                                </div>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        Priority AI responses
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        Advanced features
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                        Premium support
                                                    </li>
                                                </ul>
                                                <Button className="w-full" disabled>
                                                    Upgrade to Pro
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
