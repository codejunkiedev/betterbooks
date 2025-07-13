import { Progress } from "@/shared/components/progress";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="mb-8 w-full">
            <div className="flex items-center w-full mb-6">
                {Array.from({ length: totalSteps * 2 - 1 }, (_, idx) => {
                    // Odd indices are lines, even indices are steps
                    if (idx % 2 === 1) {
                        // Line
                        const lineIndex = Math.floor(idx / 2) + 1;
                        return (
                            <div
                                key={`line-${lineIndex}`}
                                className={`flex-1 h-1 mx-6 rounded-full transition-all duration-300 ${lineIndex < currentStep ? "bg-black" : "bg-gray-200"
                                    }`}
                            />
                        );
                    } else {
                        // Step
                        const stepNumber = Math.floor(idx / 2) + 1;
                        const isActive = stepNumber === currentStep;
                        const isCompleted = stepNumber < currentStep;
                        return (
                            <div key={`step-${stepNumber}`} className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${isCompleted
                                    ? "bg-black text-white shadow-lg"
                                    : isActive
                                        ? "bg-black text-white shadow-xl ring-4 ring-gray-100"
                                        : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                                    }`}>
                                    {isCompleted ? (
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        stepNumber
                                    )}
                                </div>
                                <span className={`text-xs font-medium mt-3 text-center max-w-28 ${isActive ? "text-black" : isCompleted ? "text-black" : "text-gray-500"
                                    }`}>
                                    {stepNumber === 1 && "Company Info"}
                                    {stepNumber === 2 && "Opening Balance"}
                                    {stepNumber === 3 && "Review"}
                                </span>
                            </div>
                        );
                    }
                })}
            </div>
            <div className="space-y-3 w-full">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">Step {currentStep} of {totalSteps}</span>
                </div>
                <div className="relative w-full">
                    <Progress
                        value={(currentStep / totalSteps) * 100}
                        className="h-3 bg-gray-100 w-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-black/5 rounded-full pointer-events-none" />
                </div>
            </div>
        </div>
    );
} 