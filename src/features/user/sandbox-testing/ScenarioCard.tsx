import React from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import {
    Play,
    Target,
    Tag,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    RotateCcw
} from "lucide-react";
import { FbrScenario } from "@/shared/types/fbr";
import { FBR_SCENARIO_STATUS } from "@/shared/constants/fbr";


interface ScenarioCardProps {
    scenario: FbrScenario;
    onStartScenario: (scenario: FbrScenario) => void;
    isApiConfigured?: boolean;
}

export function ScenarioCard({
    scenario,
    onStartScenario,
    isApiConfigured = true
}: ScenarioCardProps) {
    const getStatusInfo = () => {
        switch (scenario.status) {
            case FBR_SCENARIO_STATUS.COMPLETED:
                return {
                    icon: CheckCircle,
                    label: "Completed",
                    variant: "default" as const,
                    borderColor: "border-l-green-500",
                    bgColor: "bg-green-50",
                    textColor: "text-green-700",
                    buttonText: "Completed",
                    buttonIcon: CheckCircle,
                    buttonVariant: "outline" as const
                };
            case FBR_SCENARIO_STATUS.IN_PROGRESS:
                return {
                    icon: Clock,
                    label: "In Progress",
                    variant: "secondary" as const,
                    borderColor: "border-l-blue-500",
                    bgColor: "bg-blue-50",
                    textColor: "text-blue-700",
                    buttonText: "Continue Scenario",
                    buttonIcon: Play,
                    buttonVariant: "default" as const
                };
            case FBR_SCENARIO_STATUS.FAILED:
                return {
                    icon: XCircle,
                    label: "Failed",
                    variant: "destructive" as const,
                    borderColor: "border-l-red-500",
                    bgColor: "bg-red-50",
                    textColor: "text-red-700",
                    buttonText: "Retry Scenario",
                    buttonIcon: RotateCcw,
                    buttonVariant: "destructive" as const
                };
            default:
                return {
                    icon: AlertCircle,
                    label: "Not Started",
                    variant: "outline" as const,
                    borderColor: "border-l-gray-400",
                    bgColor: "bg-gray-50",
                    textColor: "text-gray-700",
                    buttonText: "Start Scenario",
                    buttonIcon: Play,
                    buttonVariant: "default" as const
                };
        }
    };

    const statusInfo = getStatusInfo();
    const StatusIcon = statusInfo.icon;

    return (
        <Card className={`h-full border-l-4 ${statusInfo.borderColor} flex flex-col`}>
            <div className="p-6 flex-1 flex flex-col">
                {/* Header Section */}
                <div className="space-y-3 flex-1">
                    {/* ID Badge and Status */}
                    <div className="flex items-center justify-between">
                        <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm font-medium">
                            #{scenario.code}
                        </span>
                        <Badge
                            variant={statusInfo.variant}
                            className={`flex items-center gap-2 ${statusInfo.bgColor} ${statusInfo.textColor} border-0 hover:bg-opacity-100`}
                        >
                            <StatusIcon className="h-4 w-4" />
                            {statusInfo.label}
                        </Badge>
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

                    {/* Progress Information */}
                    {(scenario.attempts !== undefined && scenario.attempts > 0) && (
                        <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Attempts:</span> {scenario.attempts}
                            {scenario.last_attempt && (
                                <span className="ml-3">
                                    <span className="font-medium">Last attempt:</span> {new Date(scenario.last_attempt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}
                    {scenario.completion_timestamp && (
                        <div className="text-xs text-green-600">
                            <span className="font-medium">Completed:</span> {new Date(scenario.completion_timestamp).toLocaleDateString()}
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="pt-2 mt-auto">
                    <Button
                        onClick={() => onStartScenario(scenario)}
                        disabled={scenario.status === FBR_SCENARIO_STATUS.COMPLETED || !isApiConfigured}
                        className="w-full"
                        size="lg"
                        variant={statusInfo.buttonVariant}
                    >
                        <div className="flex items-center gap-2">
                            {React.createElement(statusInfo.buttonIcon, { className: "h-4 w-4" })}
                            <span>{statusInfo.buttonText}</span>
                        </div>
                    </Button>
                </div>
            </div>
        </Card>
    );
}
