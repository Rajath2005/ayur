import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface RAGStep {
    step: number;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    duration?: number;
    message: string;
}

interface RAGProgressProps {
    steps: RAGStep[];
    totalDuration?: number;
}

export function RAGProgressIndicator({ steps, totalDuration }: RAGProgressProps) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const runningStep = steps.find(s => s.status === 'running');
        if (runningStep) {
            setCurrentStep(runningStep.step);
        }
    }, [steps]);

    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const progress = (completedSteps / 10) * 100;

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800 p-4 mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        Processing your query...
                    </span>
                </div>
                {totalDuration && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        {(totalDuration / 1000).toFixed(1)}s
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-emerald-200 dark:bg-emerald-900/30 rounded-full h-2 mb-3">
                <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {steps.map((step) => (
                    <div
                        key={step.step}
                        className={`flex items-center gap-2 text-xs transition-opacity ${step.status === 'pending' ? 'opacity-50' : 'opacity-100'
                            }`}
                    >
                        {/* Icon */}
                        {step.status === 'completed' && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        )}
                        {step.status === 'running' && (
                            <Loader2 className="h-3.5 w-3.5 text-emerald-600 animate-spin flex-shrink-0" />
                        )}
                        {step.status === 'pending' && (
                            <Circle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        )}
                        {step.status === 'failed' && (
                            <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                        )}

                        {/* Step Info */}
                        <span className="flex-1 text-emerald-800 dark:text-emerald-200">
                            {step.message}
                        </span>

                        {/* Duration */}
                        {step.duration && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                                {step.duration}ms
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800">
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Step {currentStep} of 10 • {Math.round(progress)}% complete
                </p>
            </div>
        </div>
    );
}
