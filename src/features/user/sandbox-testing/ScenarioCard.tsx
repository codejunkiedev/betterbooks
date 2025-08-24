import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import {
    Play,
    Target,
    Tag
} from "lucide-react";
import { FbrScenario } from "@/shared/types/fbr";
interface ScenarioCardProps {
    scenario: FbrScenario;
    hasValidSandboxKey: boolean;
    onStartScenario: (scenario: FbrScenario) => void;
}

export function ScenarioCard({
    scenario,
    hasValidSandboxKey,
    onStartScenario
}: ScenarioCardProps) {
    return (
        <Card className="h-full transition-all duration-200 hover:shadow-md">
            <div className="p-6 space-y-4">
                {/* Header Section */}
                <div className="space-y-3">
                    {/* ID Badge */}
                    <div className="flex items-center gap-2">
                        <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm font-medium">
                            #{scenario.code}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                        {scenario.description}
                    </h3>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Sale Type:</span>
                            <span className="capitalize bg-muted px-2 py-1 rounded text-foreground">
                                {scenario.sale_type}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="h-4 w-4" />
                            <span className="font-medium">Category:</span>
                            <span className="capitalize bg-muted px-2 py-1 rounded text-foreground">
                                {scenario.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-2">
                    <Button
                        onClick={() => onStartScenario(scenario)}
                        disabled={!hasValidSandboxKey}
                        className="w-full"
                        size="lg"
                    >

                        <div className="flex items-center gap-2">
                            <Play className="h-4 w-4" />
                            <span>Start Scenario</span>
                        </div>

                    </Button>
                </div>
            </div>
        </Card>
    );
}
