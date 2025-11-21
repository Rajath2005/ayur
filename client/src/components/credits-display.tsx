import { useCredits } from "@/hooks/useCredits";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function CreditsDisplay({ compact = false }: { compact?: boolean }) {
    const { credits, maxCredits, percent, cycleEnd, isLoading } = useCredits();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading credits...</span>
            </div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2" title={`Credits reset ${cycleEnd ? formatDistanceToNow(cycleEnd, { addSuffix: true }) : 'soon'}`}>
                <Zap className={`h-4 w-4 ${credits === 0 ? 'text-destructive' : 'text-primary'}`} />
                <div className="flex flex-col">
                    <span className={`text-sm font-medium ${credits === 0 ? 'text-destructive' : ''}`}>
                        {credits} / {maxCredits}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Monthly Credits</span>
                    <Zap className="h-4 w-4 text-primary" />
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-bold">{credits} remaining</span>
                        <span className="text-muted-foreground">of {maxCredits}</span>
                    </div>
                    <Progress value={percent} className={credits < 5 ? "bg-destructive/20" : ""} />
                    {cycleEnd && (
                        <p className="text-xs text-muted-foreground mt-2">
                            Resets {formatDistanceToNow(cycleEnd, { addSuffix: true })}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
