import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Stethoscope, Eye, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface ModeSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ModeSelectionModal({ open, onOpenChange }: ModeSelectionModalProps) {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [selectedMode, setSelectedMode] = useState<'GYAAN' | 'VAIDYA' | 'DRISHTI' | null>(null);

    const startModeMutation = useMutation({
        mutationFn: async (mode: 'GYAAN' | 'VAIDYA' | 'DRISHTI') => {
            const clientRequestId = uuidv4();

            if (mode === 'DRISHTI') {
                // For Drishti, we just redirect to a special upload page or handle it differently
                // But per requirements, we start upload flow. 
                // Let's assume we redirect to a chat page that handles the upload or show a specialized upload modal.
                // For simplicity in this step, let's treat Drishti start as just navigating to a specialized view
                // But wait, the requirement says "deduct 10 credits at upload start".
                // So here we just navigate to a view where upload happens.
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
            onOpenChange(false);

            if (data.mode === 'DRISHTI') {
                // Special handling for Drishti - maybe open a different modal or route
                // For now, let's route to a special route or query param
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
        }
    });

    const handleModeSelect = (mode: 'GYAAN' | 'VAIDYA' | 'DRISHTI') => {
        setSelectedMode(mode);
        startModeMutation.mutate(mode);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
                    <DialogTitle className="text-lg sm:text-xl">Choose Your Path</DialogTitle>
                    <DialogDescription className="text-sm">
                        Select how you want to interact with Ayurveda today.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable Content */}
                <div className="overflow-y-auto px-4 sm:px-6 py-4 mobile-scroll hide-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pb-safe-bottom">
                        {/* Card A: Ayurveda Gyaan */}
                        <Card
                            className={`cursor-pointer hover:border-primary transition-all hover:shadow-md ${selectedMode === 'GYAAN' ? 'border-primary shadow-md' : ''
                                }`}
                            onClick={() => handleModeSelect('GYAAN')}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                    <span className="truncate">Ayurveda Gyaan</span>
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">General Wellness Chat</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <ul className="text-xs sm:text-sm space-y-1.5 text-muted-foreground">
                                    <li>• 1 Credit to start</li>
                                    <li>• 1 Credit per response</li>
                                    <li>• General queries & tips</li>
                                </ul>
                                <Button
                                    className="w-full touch-target hover:bg-primary hover:text-primary-foreground transition-colors"
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
                            className={`cursor-pointer hover:border-primary transition-all hover:shadow-md border-primary/20 bg-primary/5 ${selectedMode === 'VAIDYA' ? 'border-primary shadow-md' : ''
                                }`}
                            onClick={() => handleModeSelect('VAIDYA')}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                    <span className="truncate">Vaidya Chat</span>
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Diagnostic Consultation</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <ul className="text-xs sm:text-sm space-y-1.5 text-muted-foreground">
                                    <li>• 5 Credits to start</li>
                                    <li>• Deep diagnostic loop</li>
                                    <li>• Personalized report</li>
                                </ul>
                                <Button
                                    className="w-full touch-target hover:bg-primary hover:text-primary-foreground transition-colors"
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
                            className={`cursor-pointer hover:border-primary transition-all hover:shadow-md sm:col-span-2 md:col-span-1 ${selectedMode === 'DRISHTI' ? 'border-primary shadow-md' : ''
                                }`}
                            onClick={() => handleModeSelect('DRISHTI')}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                    <span className="truncate">Drishti AI</span>
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">Visual Analysis</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <ul className="text-xs sm:text-sm space-y-1.5 text-muted-foreground">
                                    <li>• 10 Credits on upload</li>
                                    <li>• Tongue/Face analysis</li>
                                    <li>• Visual health report</li>
                                </ul>
                                <Button
                                    className="w-full touch-target hover:bg-primary hover:text-primary-foreground transition-colors"
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
            </DialogContent>
        </Dialog>
    );
}
