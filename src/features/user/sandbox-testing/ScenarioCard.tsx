import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import {
    CheckCircle,
    Clock,
    XCircle,
    Play,
    ArrowRight,
    Target,
    CheckSquare,
    Calendar,
    Tag
} from "lucide-react";
import { FBR_SCENARIO_STATUS } from "@/shared/constants/fbr";
import type { FbrScenarioWithProgress } from "@/shared/types/fbr";

interface ScenarioCardProps {
    scenario: FbrScenarioWithProgress;
    hasValidSandboxKey: boolean;
    testingScenario: string | null;
    onStartScenario: (scenarioId: string) => void;
    onTestScenario: (scenarioId: string) => void;
}

export function ScenarioCard({
    scenario,
    hasValidSandboxKey,
    testingScenario,
    onStartScenario,
    onTestScenario
}: ScenarioCardProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case FBR_SCENARIO_STATUS.COMPLETED:
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case FBR_SCENARIO_STATUS.IN_PROGRESS:
                return <Clock className="h-5 w-5 text-blue-500" />;
            case FBR_SCENARIO_STATUS.FAILED:
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <CheckSquare className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case FBR_SCENARIO_STATUS.COMPLETED:
                return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
            case FBR_SCENARIO_STATUS.IN_PROGRESS:
                return <Badge variant="secondary">In Progress</Badge>;
            case FBR_SCENARIO_STATUS.FAILED:
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">Not Started</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case FBR_SCENARIO_STATUS.COMPLETED:
                return 'border-l-green-500';
            case FBR_SCENARIO_STATUS.IN_PROGRESS:
                return 'border-l-blue-500';
            case FBR_SCENARIO_STATUS.FAILED:
                return 'border-l-red-500';
            default:
                return 'border-l-muted';
        }
    };

    return (
        <Card className={`h-full transition-all duration-200 hover:shadow-md border-l-4 ${getStatusColor(scenario.progress?.status || 'not_started')}`}>
            <div className="p-6 space-y-4">
                {/* Header Section */}
                <div className="space-y-3">
                    {/* Status and ID Row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm font-medium">
                                #{scenario.scenarioId}
                            </span>
                            {getStatusBadge(scenario.progress?.status || 'not_started')}
                        </div>
                        {getStatusIcon(scenario.progress?.status || 'not_started')}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground leading-tight">
                        Scenario #{scenario.scenarioId}
                    </h3>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Sale Type:</span>
                            <span className="capitalize bg-muted px-2 py-1 rounded text-foreground">
                                {scenario.saleType}
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

                {/* Description Section */}
                <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-start gap-2">
                        <div className="flex items-center justify-center w-4 h-4 bg-primary/20 rounded-full mt-0.5 flex-shrink-0">
                            <span className="text-xs font-medium text-primary">i</span>
                        </div>
                        <span className="text-sm text-muted-foreground leading-relaxed">
                            {scenario.description}
                        </span>
                    </div>
                </div>

                {/* Status Messages */}
                {scenario.progress?.status === 'completed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div className="flex-1">
                                <div className="font-medium text-green-800">Successfully Completed</div>
                                <div className="flex items-center gap-2 text-sm text-green-700 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Completed on {new Date(scenario.progress.completion_timestamp!).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {scenario.progress?.status === 'failed' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <div className="flex-1">
                                <div className="font-medium text-red-800">Test Failed</div>
                                <div className="text-sm text-red-700 mt-1">
                                    {scenario.progress.fbr_response}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                    {(scenario.progress?.status === 'not_started' || !scenario.progress) && (
                        <Button
                            onClick={() => onStartScenario(scenario.scenarioId)}
                            disabled={!hasValidSandboxKey || testingScenario === scenario.scenarioId}
                            className="w-full"
                            size="lg"
                        >
                            {testingScenario === scenario.scenarioId ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                    <span>Starting Scenario...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Play className="h-4 w-4" />
                                    <span>Start Scenario</span>
                                </div>
                            )}
                        </Button>
                    )}

                    {scenario.progress?.status === 'in_progress' && (
                        <Button
                            onClick={() => onTestScenario(scenario.scenarioId)}
                            disabled={!hasValidSandboxKey || testingScenario === scenario.scenarioId}
                            variant="secondary"
                            className="w-full"
                            size="lg"
                        >
                            {testingScenario === scenario.scenarioId ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                    <span>Running Test...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4" />
                                    <span>Continue Test</span>
                                </div>
                            )}
                        </Button>
                    )}

                    {scenario.progress?.status === 'failed' && (
                        <Button
                            onClick={() => onTestScenario(scenario.scenarioId)}
                            disabled={!hasValidSandboxKey || testingScenario === scenario.scenarioId}
                            variant="outline"
                            className="w-full"
                            size="lg"
                        >
                            {testingScenario === scenario.scenarioId ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                    <span>Retrying...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4" />
                                    <span>Try Again</span>
                                </div>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
