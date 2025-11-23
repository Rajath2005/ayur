import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { DrishtiUpload } from "@/components/DrishtiUpload";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function DrishtiPage() {
    const [, setLocation] = useLocation();
    const [analysisId, setAnalysisId] = useState<string | null>(null);

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
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <h1 className="text-lg font-semibold flex items-center gap-2">
                                    <Eye className="h-5 w-5 text-primary" />
                                    Drishti AI Analysis
                                </h1>
                            </div>
                        </div>
                        <ThemeToggle />
                    </header>

                    <main className="flex-1 overflow-auto p-6 md:p-8">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight">Visual Health Assessment</h2>
                                <p className="text-muted-foreground max-w-2xl mx-auto">
                                    Upload a photo of your face, tongue, or skin. Drishti AI will analyze visual markers
                                    to identify potential dosha imbalances and health indicators.
                                </p>
                            </div>

                            <DrishtiUpload
                                onAnalysisComplete={(id, report) => {
                                    setAnalysisId(id);
                                    // Optional: Could redirect to a dedicated report page or just show inline
                                }}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
