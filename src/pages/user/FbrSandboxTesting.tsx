import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { Progress } from "@/shared/components/Progress";
import { useToast } from "@/shared/hooks/useToast";
import {
    getUserScenarios,
    getScenarioProgress,
    initializeScenarioProgress,
    getScenarioSummary,
    getFbrConfigStatus
} from "@/shared/services/supabase/fbr";
import { FBR_API_STATUS, FBR_SCENARIOS, FBR_SCENARIO_STATUS } from "@/shared/constants/fbr";
import type { FbrScenarioProgress, FbrScenarioSummary } from "@/shared/types/fbr";
import type { RootState } from "@/shared/services/store";
import {
    CheckCircle,
    Clock,
    XCircle,
    Play,
    AlertCircle,
    Trophy,
    Settings
} from "lucide-react";

export default function FbrSandboxTesting() {
    const { user } = useSelector((s: RootState) => s.user);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [scenarios, setScenarios] = useState<string[]>([]);
    const [scenarioProgress, setScenarioProgress] = useState<FbrScenarioProgress[]>([]);
    const [summary, setSummary] = useState<FbrScenarioSummary | null>(null);
    const [sandboxConfigured, setSandboxConfigured] = useState(false);

    useEffect(() => {
        loadSandboxData();
    }, []);

    const loadSandboxData = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Check if sandbox is configured
            const configStatus = await getFbrConfigStatus(user.id);
            setSandboxConfigured(configStatus.sandbox_status === FBR_API_STATUS.CONNECTED);

            // Get user's mandatory scenarios
            const userScenarios = await getUserScenarios(user.id);
            setScenarios(userScenarios);

            if (userScenarios.length > 0) {
                // Initialize scenario progress if needed
                await initializeScenarioProgress(user.id, userScenarios);

                // Get scenario progress
                const progress = await getScenarioProgress(user.id);
                setScenarioProgress(progress);

                // Get summary
                const scenarioSummary = await getScenarioSummary(user.id);
                setSummary(scenarioSummary);
            }
        } catch (error) {
            console.error('Failed to load sandbox data:', error);
            toast({
                title: "Error",
                description: "Failed to load sandbox testing data.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const getScenarioStatus = (scenarioId: string) => {
        return scenarioProgress.find(p => p.scenario_id === scenarioId)?.status || 'not_started';
    };

    const getScenarioAttempts = (scenarioId: string) => {
        return scenarioProgress.find(p => p.scenario_id === scenarioId)?.attempts || 0;
    };

    const getScenarioLastAttempt = (scenarioId: string) => {
        return scenarioProgress.find(p => p.scenario_id === scenarioId)?.last_attempt;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case FBR_SCENARIO_STATUS.COMPLETED:
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case FBR_SCENARIO_STATUS.IN_PROGRESS:
                return <Clock className="h-4 w-4 text-blue-600" />;
            case FBR_SCENARIO_STATUS.FAILED:
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case FBR_SCENARIO_STATUS.COMPLETED:
                return <Badge variant="default">Completed</Badge>;
            case FBR_SCENARIO_STATUS.IN_PROGRESS:
                return <Badge variant="secondary">In Progress</Badge>;
            case FBR_SCENARIO_STATUS.FAILED:
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">Not Started</Badge>;
        }
    };

    const handleStartScenario = (scenarioId: string) => {
        // Navigate to invoice creation with scenario data
        navigate('/upload', {
            state: {
                scenarioId,
                scenarioData: FBR_SCENARIOS[scenarioId]?.sampleData
            }
        });
    };

    const handleConfigureSandbox = () => {
        navigate('/fbr/api-config');
    };

    const handleConfigureProduction = () => {
        navigate('/fbr/api-config', { state: { focusProduction: true } });
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight">FBR Sandbox Testing</h1>
                        <p className="text-gray-500 text-lg">Loading scenarios...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!sandboxConfigured) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight">FBR Sandbox Testing</h1>
                        <p className="text-gray-500 text-lg">Configure your sandbox API key to start testing</p>
                    </div>

                    <Card className="p-6">
                        <CardContent className="text-center space-y-4">
                            <Settings className="h-12 w-12 text-gray-400 mx-auto" />
                            <h3 className="text-lg font-medium">Sandbox API Key Required</h3>
                            <p className="text-gray-500">
                                You need to configure and test your FBR sandbox API key before you can start scenario testing.
                            </p>
                            <Button onClick={handleConfigureSandbox}>
                                Configure Sandbox API
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (scenarios.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight">FBR Sandbox Testing</h1>
                        <p className="text-gray-500 text-lg">No scenarios available for your business activity</p>
                    </div>

                    <Card className="p-6">
                        <CardContent className="text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                            <h3 className="text-lg font-medium">No Scenarios Found</h3>
                            <p className="text-gray-500">
                                There are no mandatory test scenarios configured for your business activity.
                                Please contact support if you believe this is an error.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight">FBR Sandbox Testing</h1>
                    <p className="text-gray-500 text-lg">Complete mandatory test scenarios to validate your integration</p>
                </div>

                {/* Progress Summary */}
                {summary && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                Testing Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Progress value={summary.completionPercentage} className="h-2" />
                                </div>
                                <span className="text-sm font-medium text-gray-600">
                                    {summary.completionPercentage}%
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-semibold text-green-600">{summary.completedScenarios}</div>
                                    <div className="text-gray-500">Completed</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-blue-600">{summary.inProgressScenarios}</div>
                                    <div className="text-gray-500">In Progress</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-red-600">{summary.failedScenarios}</div>
                                    <div className="text-gray-500">Failed</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold text-gray-600">{summary.notStartedScenarios}</div>
                                    <div className="text-gray-500">Not Started</div>
                                </div>
                            </div>

                            {summary.isComplete && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-green-800">
                                        <CheckCircle className="h-5 w-5" />
                                        <span className="font-medium">Sandbox Testing Complete!</span>
                                    </div>
                                    <p className="text-green-700 text-sm mt-1">
                                        All mandatory scenarios have been completed successfully. You can now configure your production API key.
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-green-200">
                                        <h4 className="font-medium text-green-800 mb-2">Certification Summary</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-green-700">Total Scenarios:</span>
                                                <span className="ml-2 font-medium">{summary.totalScenarios}</span>
                                            </div>
                                            <div>
                                                <span className="text-green-700">Success Rate:</span>
                                                <span className="ml-2 font-medium">100%</span>
                                            </div>
                                            <div>
                                                <span className="text-green-700">Completion Date:</span>
                                                <span className="ml-2 font-medium">{new Date().toLocaleDateString()}</span>
                                            </div>
                                            <div>
                                                <span className="text-green-700">Status:</span>
                                                <span className="ml-2 font-medium">Certified</span>
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <Button
                                                onClick={handleConfigureProduction}
                                                variant="outline"
                                                size="sm"
                                                className="text-green-700 border-green-300 hover:bg-green-100"
                                            >
                                                Configure Production API
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Scenarios List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mandatory Test Scenarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {scenarios.map((scenarioId) => {
                                const scenario = FBR_SCENARIOS[scenarioId];
                                const status = getScenarioStatus(scenarioId);
                                const attempts = getScenarioAttempts(scenarioId);

                                if (!scenario) return null;

                                return (
                                    <div key={scenarioId} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(status)}
                                                <div>
                                                    <h3 className="font-medium">{scenarioId}: {scenario.description}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {scenario.requirements.length} requirements
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(status)}
                                                {attempts > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        {attempts} attempt{attempts !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {status === FBR_SCENARIO_STATUS.COMPLETED && getScenarioLastAttempt(scenarioId) && (
                                            <div className="text-xs text-green-600 mt-2">
                                                Completed on {new Date(getScenarioLastAttempt(scenarioId)!).toLocaleDateString()}
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-2">Requirements:</h4>
                                                <ul className="space-y-1 text-gray-600">
                                                    {scenario.requirements.map((req, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-gray-400">•</span>
                                                            <span>{req}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-2">Expected Outcomes:</h4>
                                                <ul className="space-y-1 text-gray-600">
                                                    {scenario.expectedOutcomes.map((outcome, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="text-gray-400">•</span>
                                                            <span>{outcome}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            {status === FBR_SCENARIO_STATUS.NOT_STARTED && (
                                                <Button
                                                    onClick={() => handleStartScenario(scenarioId)}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    Start Scenario
                                                </Button>
                                            )}
                                            {status === FBR_SCENARIO_STATUS.IN_PROGRESS && (
                                                <Button
                                                    onClick={() => handleStartScenario(scenarioId)}
                                                    variant="secondary"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Clock className="h-4 w-4" />
                                                    Continue Scenario
                                                </Button>
                                            )}
                                            {status === FBR_SCENARIO_STATUS.FAILED && (
                                                <Button
                                                    onClick={() => handleStartScenario(scenarioId)}
                                                    variant="outline"
                                                    className="flex items-center gap-2"
                                                >
                                                    <Play className="h-4 w-4" />
                                                    Retry Scenario
                                                </Button>
                                            )}
                                            {status === FBR_SCENARIO_STATUS.COMPLETED && (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Completed</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
