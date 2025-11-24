import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

interface SimulatedRAGProgressProps {
    isVisible: boolean;
}

const RAG_STEPS = [
    { name: 'Analyzing query', duration: 800 },
    { name: 'Searching knowledge base', duration: 1200 },
    { name: 'Retrieving context', duration: 1000 },
    { name: 'Generating answer', duration: 2000 },
    { name: 'Verifying accuracy', duration: 600 },
];

export function SimulatedRAGProgress({ isVisible }: SimulatedRAGProgressProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            setCompletedSteps([]);
            return;
        }

        // Simulate step progression
        let stepIndex = 0;
        const intervals: NodeJS.Timeout[] = [];

        const progressThroughSteps = () => {
            let accumulatedTime = 0;

            RAG_STEPS.forEach((step, index) => {
                const timeout = setTimeout(() => {
                    setCurrentStep(index);

                    // Mark previous step as completed
                    if (index > 0) {
                        setCompletedSteps(prev => [...prev, index - 1]);
                    }
                }, accumulatedTime);

                intervals.push(timeout);
                accumulatedTime += step.duration;
            });

            // Mark last step as completed
            const finalTimeout = setTimeout(() => {
                setCompletedSteps(prev => [...prev, RAG_STEPS.length - 1]);
            }, accumulatedTime);
            intervals.push(finalTimeout);
        };

        progressThroughSteps();

        return () => {
            intervals.forEach(clearTimeout);
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const progress = ((completedSteps.length) / RAG_STEPS.length) * 100;

    return (
        <div className="bg-gradient-to-br from-emerald-50/80 to-green-50/80 dark:from-emerald-950/30 dark:to-green-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 p-4 mb-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Loader2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 animate-spin" />
                        <div className="absolute inset-0 h-4 w-4 text-emerald-600/20 dark:text-emerald-400/20 animate-ping" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        AyuDost is thinking...
                    </span>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                    {Math.round(progress)}%
                </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-emerald-200/50 dark:bg-emerald-900/30 rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="space-y-2">
                {RAG_STEPS.map((step, index) => {
                    const isCompleted = completedSteps.includes(index);
                    const isActive = currentStep === index && !isCompleted;
                    const isPending = index > currentStep;

                    return (
                        <div
                            key={index}
                            className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${isPending ? 'opacity-40' : 'opacity-100'
                                }`}
                        >
                            {/* Icon */}
                            <div className="flex-shrink-0">
                                {isCompleted && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in duration-200" />
                                )}
                                {isActive && (
                                    <Loader2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-spin" />
                                )}
                                {isPending && (
                                    <Circle className="h-3.5 w-3.5 text-gray-400 dark:text-gray-600" />
                                )}
                            </div>

                            {/* Step Name */}
                            <span className={`flex-1 ${isCompleted
                                    ? 'text-emerald-700 dark:text-emerald-300 font-medium'
                                    : isActive
                                        ? 'text-emerald-800 dark:text-emerald-200 font-medium'
                                        : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                {step.name}
                            </span>

                            {/* Checkmark animation */}
                            {isCompleted && (
                                <span className="text-emerald-600 dark:text-emerald-400 animate-in zoom-in duration-200">
                                    ✓
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer hint */}
            <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
                <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70 text-center">
                    Processing your Ayurvedic query with care...
                </p>
            </div>
        </div>
    );
}
