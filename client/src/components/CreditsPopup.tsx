import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Zap, MessageSquare, Bot, Image as ImageIcon, History, ArrowRight } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface CreditsPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CreditLog {
    id: string;
    type: string;
    amount: number;
    timestamp: string;
}

interface CreditsDetails {
    remainingCredits: number;
    maxCredits: number;
    usedCredits: number;
    resetInDays: number;
    cycleEnd: string;
    usageHistory: CreditLog[];
}

export default function CreditsPopup({ isOpen, onClose }: CreditsPopupProps) {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    // Fetch credits details
    const { data: details, isLoading, error, refetch } = useQuery<CreditsDetails>({
        queryKey: ["credits-details"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/users/me/credits/details");
            if (!res.ok) {
                throw new Error(`Failed to fetch credits: ${res.status}`);
            }
            const data = await res.json();
            console.log("Credits API Response:", data); // Debug log
            return data;
        },
        enabled: isOpen,
        refetchInterval: isOpen ? 5000 : false, // Real-time updates every 5s when open
        retry: 2,
    });

    if (!isOpen) return null;

    const percentage = details ? (details.remainingCredits / details.maxCredits) * 100 : 0;

    // Color logic
    let progressColor = "bg-green-500";
    let textColor = "text-green-600 dark:text-green-400";
    if (percentage < 20) {
        progressColor = "bg-red-500";
        textColor = "text-red-600 dark:text-red-400";
    } else if (percentage < 50) {
        progressColor = "bg-yellow-500";
        textColor = "text-yellow-600 dark:text-yellow-400";
    }

    const modalContent = (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative z-[1000000] w-full max-w-[420px] max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">

                {/* 1. Header Section */}
                <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                            <Zap className="h-5 w-5 text-green-600 dark:text-green-400 fill-current" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Credits Overview</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <X className="h-4 w-4 text-zinc-500" />
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">

                    {/* 2. Current Credits Summary */}
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-100 dark:border-zinc-700/50">
                        {error && (
                            <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    Error loading credits: {error instanceof Error ? error.message : 'Unknown error'}
                                </p>
                            </div>
                        )}
                        <div className="flex items-baseline justify-between mb-2">
                            <div className="flex items-baseline gap-1">
                                <span className={`text-3xl font-bold ${textColor}`}>
                                    {isLoading ? "..." : (details?.remainingCredits ?? 0)}
                                </span>
                                <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                                    / {details?.maxCredits ?? 40} Credits
                                </span>
                            </div>
                            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Remaining</span>
                        </div>

                        <div className="h-2.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${progressColor} transition-all duration-500 ease-out`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>

                    {/* 3. Credits Usage Breakdown */}
                    <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Cost Breakdown</h3>
                        <div className="space-y-3">
                            {/* Ayurveda Gyaan */}
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                                            <MessageSquare className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ayurveda Gyaan</span>
                                    </div>
                                    <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">1 Credit</span>
                                </div>
                                <div className="pl-9 space-y-1">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">• General Wellness Chat</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">• 1 Credit to start & per response</p>
                                </div>
                            </div>

                            {/* Vaidya Chat */}
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md text-green-600 dark:text-green-400">
                                            <Zap className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Vaidya Chat</span>
                                    </div>
                                    <span className="text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md">5 Credits</span>
                                </div>
                                <div className="pl-9 space-y-1">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">• Diagnostic Consultation</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">• Deep diagnostic loop & report</p>
                                </div>
                            </div>

                            {/* Drishti AI */}
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-md text-purple-600 dark:text-purple-400">
                                            <ImageIcon className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Drishti AI</span>
                                    </div>
                                    <span className="text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-md">10 Credits</span>
                                </div>
                                <div className="pl-9 space-y-1">
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">• Visual Analysis (Tongue/Face)</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">• Visual health report</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Upcoming Reset */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20 flex items-start gap-3">
                        <History className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Credits reset in <span className="font-bold">{details?.resetInDays || 15} days</span>
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                Next cycle starts on {details?.cycleEnd ? format(new Date(details.cycleEnd), 'MMM d, yyyy') : '...'}
                            </p>
                        </div>
                    </div>

                    {/* 5. Credits Usage Log */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Recent Activity</h3>
                            {/* <button className="text-xs text-primary hover:underline flex items-center gap-1">
                See full history <ArrowRight className="h-3 w-3" />
              </button> */}
                        </div>

                        <div className="space-y-3 pl-2 border-l-2 border-zinc-100 dark:border-zinc-800 ml-1">
                            {isLoading ? (
                                <div className="text-xs text-zinc-400 pl-4 py-2">Loading history...</div>
                            ) : details?.usageHistory?.length === 0 ? (
                                <div className="text-xs text-zinc-400 pl-4 py-2">No recent activity</div>
                            ) : (
                                details?.usageHistory?.map((log) => (
                                    <div key={log.id} className="relative pl-4 group">
                                        {/* Timeline dot */}
                                        <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-700 group-hover:bg-primary transition-colors ring-4 ring-white dark:ring-zinc-900" />

                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                    {log.type.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-xs text-zinc-400">
                                                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                                                -{log.amount}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

                {/* 6. Buttons Section */}
                <div className="p-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-2xl flex gap-3">
                    <Button className="flex-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200" onClick={onClose}>
                        Got it
                    </Button>
                    {/* <Button variant="outline" className="flex-1 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            Upgrade Plan
          </Button> */}
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
