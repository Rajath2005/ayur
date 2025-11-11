import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Coins, Zap, MessageCircle, Image } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  maxCredits: number;
}

export default function CreditsModal({ isOpen, onClose, credits, maxCredits }: CreditsModalProps) {
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

  if (!isOpen) return null;

  const usageData = [
    { action: 'New Chat', cost: 2, icon: MessageCircle },
    { action: 'Chatbot Response', cost: 1, icon: MessageCircle },
    { action: 'Image Generation', cost: 5, icon: Image },
  ];

  const modalContent = (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-[1000000] w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Credits Usage
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Credits Balance */}
          <div className="text-center mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
            <div className="text-3xl font-bold text-primary mb-1">
              {credits}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              of {maxCredits} credits remaining
            </div>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${(credits / maxCredits) * 100}%` }}
              />
            </div>
          </div>

          {/* Usage Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Credit Costs
            </h3>
            <div className="space-y-2">
              {usageData.map((item) => (
                <div key={item.action} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <item.icon className="h-4 w-4 text-gray-500 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                      {item.action}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0 ml-3">
                    {item.cost} credit{item.cost > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Benefits
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Credits refresh every 15 or 30 days depending on the plan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Credits are valid for 15 or 30 days, not daily</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Premium features included</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal at document body level using portal
  return createPortal(modalContent, document.body);
}