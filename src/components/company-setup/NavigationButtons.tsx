import { Button } from "@/components/ui/button";

interface NavigationButtonsProps {
    currentStep: number;
    totalSteps: number;
    onPrevious: () => void;
    onNext: () => void;
    onSubmit: () => void;
    isLoading: boolean;
    canProceed: boolean;
}

export function NavigationButtons({
    currentStep,
    totalSteps,
    onPrevious,
    onNext,
    onSubmit,
    isLoading,
    canProceed
}: NavigationButtonsProps) {
    return (
        <div className="flex gap-3">
            {currentStep > 1 && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={onPrevious}
                    disabled={isLoading}
                    className="flex-1"
                >
                    Previous
                </Button>
            )}

            {currentStep < totalSteps ? (
                <Button
                    type="button"
                    onClick={onNext}
                    disabled={isLoading || !canProceed}
                    className="flex-1"
                >
                    Next
                </Button>
            ) : (
                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="flex-1"
                >
                    {isLoading ? "Setting up..." : "Complete Setup"}
                </Button>
            )}
        </div>
    );
} 