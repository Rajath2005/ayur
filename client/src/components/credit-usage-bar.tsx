import { cn } from "@/lib/utils";

interface CreditUsageBarProps {
  credits: number;
  maxCredits: number;
  className?: string;
}

export function CreditUsageBar({ credits, maxCredits, className }: CreditUsageBarProps) {
  const percent = Math.max(0, Math.min(100, Math.round((credits / maxCredits) * 100)));

  // Color logic: green >= 50%, amber 20-49%, red < 20%
  const getBarColor = () => {
    if (percent >= 50) return "bg-green-500";
    if (percent >= 20) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Credits used</span>
        <span>{credits} / {maxCredits} ({percent}%)</span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={maxCredits}
        aria-valuenow={credits}
        aria-label={`Credits remaining ${credits} of ${maxCredits}`}
        className="w-full bg-muted rounded-full h-2 overflow-hidden"
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300 ease-out", getBarColor())}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
