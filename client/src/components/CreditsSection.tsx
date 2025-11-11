import { useState } from 'react';
import CreditsModal from './CreditsModal';

interface CreditsSectionProps {
  credits: number;
  maxCredits: number;
}

export default function CreditsSection({ credits, maxCredits }: CreditsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const usagePercentage = ((maxCredits - credits) / maxCredits) * 100;

  return (
    <>
      <div 
        className="space-y-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Credits used</span>
          <span>{maxCredits - credits} / {maxCredits} ({Math.round(usagePercentage)}%)</span>
        </div>
        <div 
          role="progressbar" 
          aria-valuemin="0" 
          aria-valuemax={maxCredits} 
          aria-valuenow={maxCredits - credits} 
          aria-label={`Credits remaining ${credits} of ${maxCredits}`} 
          className="w-full bg-muted rounded-full h-2 overflow-hidden"
        >
          <div 
            className="h-full rounded-full transition-all duration-300 ease-out bg-amber-500" 
            style={{ width: `${usagePercentage}%` }}
          />
        </div>
      </div>

      <CreditsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        credits={credits}
        maxCredits={maxCredits}
      />
    </>
  );
}