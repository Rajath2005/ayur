import { useState } from 'react';
import { Coins } from 'lucide-react';
import CreditsModal from './CreditsModal';

interface CreditsButtonProps {
  credits: number;
  maxCredits: number;
}

export default function CreditsButton({ credits, maxCredits }: CreditsButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-xs sm:text-sm font-medium text-primary cursor-pointer ml-auto shrink-0"
        title={`Credits: ${credits}/${maxCredits}`}
        aria-label={`Credits remaining: ${credits} of ${maxCredits}`}
      >
        <Coins className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden xs:inline">Credits: {credits}/{maxCredits}</span>
        <span className="xs:hidden">{credits}</span>
      </button>

      <CreditsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        credits={credits}
        maxCredits={maxCredits}
      />
    </>
  );
}
