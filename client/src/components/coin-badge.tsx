import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinBadgeProps {
  credits: number;
  maxCredits: number;
  onClick?: () => void;
  className?: string;
}

export function CoinBadge({ credits, maxCredits, onClick, className }: CoinBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors",
        "text-sm font-medium text-primary",
        onClick && "cursor-pointer",
        className
      )}
      title={`Credits: ${credits} of ${maxCredits}`}
      aria-label={`Credits remaining: ${credits} of ${maxCredits}`}
    >
      <Coins className="h-4 w-4" />
      <span>{credits}</span>
    </button>
  );
}
