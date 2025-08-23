import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/shared/services/store";
import { useToast } from "@/shared/hooks/useToast";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Progress } from "@/shared/components/Progress";
import { Badge } from "@/shared/components/Badge";
import { Alert, AlertDescription } from "@/shared/components/Alert";
import { Input } from "@/shared/components/Input";
import { Search } from "lucide-react";
import {
    CheckCircle,
    Clock,
    XCircle,
    Play,
    AlertCircle,
    Trophy,
    ArrowRight,
    FileText,
    Target,
    CheckSquare
} from "lucide-react";
import { FBR_SCENARIO_STATUS } from "@/shared/constants/fbr";
import type { FbrScenarioWithProgress } from "@/shared/types/fbr";
import {
    getUserBusinessActivityId,
    getMandatoryScenarios,
    getUserScenarioProgress,
    getScenarioProgressSummary,
    updateScenarioProgress,
    initializeScenarioProgress
} from "@/shared/services/supabase/fbr";
import { submitSandboxTestInvoice } from "@/shared/services/api/fbr";

export default function SandboxTesting() {
    const { user } = useSelector((s: RootState) => s.user);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [scenarios, setScenarios] = useState<FbrScenarioWithProgress[]>([]);
    const [filteredScenarios, setFilteredScenarios] = useState<FbrScenarioWithProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [progressSummary, setProgressSummary] = useState({
        total: 0,
        completed: 0,
        inProgress: 0,
        failed: 0,
        notStarted: 0,
        completionPercentage: 0
    });
    const [testingScenario, setTestingScenario] = useState<string | null>(null);
    const [hasValidSandboxKey, setHasValidSandboxKey] = useState(false);

    const generateScenarioData = () => {
        const baseData = {
            invoiceType: 'Sale Invoice',
            buyerNTNCNIC: '1234567890123',
            items: [
                {
                    itemName: 'Test Product',
                    quantity: 1,
                    unitPrice: 1000,
                    totalAmount: 1000
                }
            ],
            totalAmount: 1000
        };

        const baseRequirements = [
            'Create invoice with required fields',
            'Include buyer NTN/CNIC',
            'Calculate total amount correctly'
        ];

        const baseOutcomes = [
            'Invoice successfully submitted to FBR',
            'Receive confirmation response',
            'Scenario marked as completed'
        ];

        return {
            sampleData: baseData,
            requirements: baseRequirements,
            expectedOutcomes: baseOutcomes
        };
    };

    useEffect(() => {
        loadScenarios();
    }, []);

    useEffect(() => {
        // Filter scenarios based on search query
        if (searchQuery.trim() === "") {
            setFilteredScenarios(scenarios);
        } else {
            const filtered = scenarios.filter(scenario =>
                scenario.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                scenario.scenarioId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                scenario.saleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                scenario.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                scenario.progress?.status.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredScenarios(filtered);
        }
    }, [searchQuery, scenarios]);

    const loadScenarios = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);

            // Get user's business activity
            const businessActivityId = await getUserBusinessActivityId(user.id);
            if (!businessActivityId) {
                toast({
                    title: "Profile Required",
                    description: "Please complete your FBR profile first to access sandbox testing.",
                    variant: "destructive"
                });
                navigate("/fbr/api-config");
                return;
            }

            // Get mandatory scenarios for business activity with full details
            const mandatoryScenarios = await getMandatoryScenarios(businessActivityId);

            // Get user's progress (scenarios should already be initialized during onboarding)
            const userProgress = await getUserScenarioProgress(user.id);

            // Fallback: Initialize scenarios if they don't exist (for users who completed onboarding before this change)
            if (userProgress.length === 0 && mandatoryScenarios.length > 0) {
                try {
                    const scenarioIds = mandatoryScenarios.map(s => s.scenario_id);
                    await initializeScenarioProgress(user.id, scenarioIds);
                    // Reload progress after initialization
                    const updatedProgress = await getUserScenarioProgress(user.id);
                    userProgress.push(...updatedProgress);
                } catch (error) {
                    console.error('Failed to initialize scenarios during fallback:', error);
                }
            }

            // Create scenarios with progress using database data
            const scenariosWithProgress = mandatoryScenarios.map((scenarioData) => {
                const progress = userProgress.find(p => p.scenario_id === scenarioData.scenario_id);

                // Generate basic scenario data
                const { sampleData, requirements, expectedOutcomes } = generateScenarioData();

                return {
                    scenarioId: scenarioData.scenario.code,
                    description: scenarioData.scenario.description,
                    saleType: scenarioData.scenario.sale_type,
                    category: scenarioData.scenario.category,
                    mandatoryFields: ['invoiceType', 'buyerNTNCNIC', 'items', 'totalAmount'],
                    sampleData,
                    requirements,
                    expectedOutcomes,
                    progress
                } as FbrScenarioWithProgress;
            });

            setScenarios(scenariosWithProgress);
            setFilteredScenarios(scenariosWithProgress);

            // Get progress summary
            const summary = await getScenarioProgressSummary(user.id);
            setProgressSummary(summary);

            // Check if user has valid sandbox key
            const { getFbrConfigStatus } = await import("@/shared/services/supabase/fbr");
            const config = await getFbrConfigStatus(user.id);
            setHasValidSandboxKey(config.sandbox_status === 'connected' && !!config.sandbox_api_key);

        } catch (error) {
            console.error('Error loading scenarios:', error);
            toast({
                title: "Error",
                description: "Failed to load scenarios. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStartScenario = async (scenarioId: string) => {
        if (!user?.id) return;

        try {
            setTestingScenario(scenarioId);

            // Update scenario status to in progress
            await updateScenarioProgress(user.id, scenarioId, 'in_progress');

            // Test the scenario directly
            await handleTestScenario(scenarioId);

        } catch (error) {
            console.error('Error starting scenario:', error);
            toast({
                title: "Error",
                description: "Failed to start scenario. Please try again.",
                variant: "destructive"
            });
        } finally {
            setTestingScenario(null);
        }
    };

    const handleTestScenario = async (scenarioId: string) => {
        if (!user?.id) return;

        try {
            setTestingScenario(scenarioId);

            // Submit test invoice with basic test data
            const response = await submitSandboxTestInvoice({
                scenarioId,
                invoiceData: {
                    invoiceType: 'Sale Invoice',
                    buyerNTNCNIC: '1234567890123',
                    items: [
                        {
                            itemName: 'Test Product',
                            quantity: 1,
                            unitPrice: 1000,
                            totalAmount: 1000
                        }
                    ],
                    totalAmount: 1000
                },
                userId: user.id
            });

            if (response.success) {
                // Update scenario status to completed
                await updateScenarioProgress(
                    user.id,
                    scenarioId,
                    'completed',
                    JSON.stringify(response.data?.fbrResponse)
                );

                toast({
                    title: "Success",
                    description: "Scenario completed successfully!",
                });

                // Reload scenarios to update progress
                await loadScenarios();
            } else {
                // Update scenario status to failed
                await updateScenarioProgress(
                    user.id,
                    scenarioId,
                    'failed',
                    response.message
                );

                toast({
                    title: "Test Failed",
                    description: response.message,
                    variant: "destructive"
                });

                // Reload scenarios to update progress
                await loadScenarios();
            }

        } catch (error) {
            console.error('Error testing scenario:', error);
            toast({
                title: "Error",
                description: "Failed to test scenario. Please try again.",
                variant: "destructive"
            });
        } finally {
            setTestingScenario(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case FBR_SCENARIO_STATUS.COMPLETED:
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case FBR_SCENARIO_STATUS.IN_PROGRESS:
                return <Clock className="h-5 w-5 text-blue-500" />;
            case FBR_SCENARIO_STATUS.FAILED:
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-400" />;
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

    const getCompletionMessage = () => {
        if (progressSummary.completionPercentage === 100) {
            return "🎉 All mandatory scenarios completed! You can now configure your production API key.";
        } else if (progressSummary.completionPercentage >= 50) {
            return "Great progress! Keep going to complete all mandatory scenarios.";
        } else {
            return "Start testing your FBR integration with these mandatory scenarios.";
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl p-6 space-y-6">
                {/* Header Skeleton */}
                <div className="space-y-3">
                    <div className="h-9 bg-gray-200 rounded-md w-80 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-md w-96 animate-pulse"></div>
                </div>

                {/* Alert Skeleton */}
                <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start space-x-3">
                        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                    </div>
                </div>

                {/* Progress Summary Skeleton */}
                <div className="rounded-lg border border-gray-200 p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                <div className="h-5 bg-gray-200 rounded-md w-12 animate-pulse"></div>
                            </div>
                        </div>

                        <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse"></div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="text-center space-y-2">
                                    <div className="h-6 bg-gray-200 rounded-md w-8 mx-auto animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded-md w-20 mx-auto animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Search Skeleton */}
                <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
                </div>

                {/* Scenarios List Skeleton */}
                <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse"></div>

                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="space-y-2">
                                            <div className="h-5 bg-gray-200 rounded-md w-64 animate-pulse"></div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded-md w-4 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded-md w-4 animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded-md w-28 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                                            <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                                        </div>
                                        <div className="ml-6 space-y-2">
                                            {[...Array(3)].map((_, j) => (
                                                <div key={j} className="flex items-start gap-2">
                                                    <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse"></div>
                                                    <div className="h-4 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                                    <div className="h-9 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl p-6 space-y-6">
            <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">FBR Sandbox Testing</h1>
                <p className="text-gray-500 text-lg">{getCompletionMessage()}</p>
            </div>

            {!hasValidSandboxKey && (
                <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        You need to configure a valid sandbox API key to test scenarios.{" "}
                        <Button
                            variant="link"
                            className="p-0 h-auto font-semibold text-orange-700 hover:text-orange-800"
                            onClick={() => navigate("/fbr/api-config")}
                        >
                            Configure API Key
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Progress Summary */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Overall Progress</h2>
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            <span className="font-semibold">{progressSummary.completionPercentage}%</span>
                        </div>
                    </div>

                    <Progress value={progressSummary.completionPercentage} className="h-3" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                            <div className="font-semibold text-green-600">{progressSummary.completed}</div>
                            <div className="text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-blue-600">{progressSummary.inProgress}</div>
                            <div className="text-gray-500">In Progress</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-red-600">{progressSummary.failed}</div>
                            <div className="text-gray-500">Failed</div>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-600">{progressSummary.notStarted}</div>
                            <div className="text-gray-500">Not Started</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Search Bar */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Mandatory Test Scenarios</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search scenarios by description, ID, sale type, category, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {searchQuery && (
                    <p className="text-sm text-gray-600">
                        Showing {filteredScenarios.length} of {scenarios.length} scenarios
                    </p>
                )}
            </div>

            {/* Scenarios List */}
            <div className="space-y-4">
                {filteredScenarios.length === 0 ? (
                    <Card className="p-6 text-center">
                        <div className="space-y-2">
                            <Search className="h-8 w-8 text-gray-400 mx-auto" />
                            <h3 className="text-lg font-medium text-gray-900">No scenarios found</h3>
                            <p className="text-gray-500">
                                {searchQuery
                                    ? `No scenarios match "${searchQuery}". Try adjusting your search terms.`
                                    : "No scenarios available for your business activity."
                                }
                            </p>
                            {searchQuery && (
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-2"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    </Card>
                ) : (
                    filteredScenarios.map((scenario) => (
                        <Card key={scenario.scenarioId} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(scenario.progress?.status || 'not_started')}
                                        <div>
                                            <h3 className="font-semibold">{scenario.description}</h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>Scenario {scenario.scenarioId}</span>
                                                <span>•</span>
                                                <span>{scenario.saleType}</span>
                                                <span>•</span>
                                                <span>{scenario.category}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Target className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium">Requirements:</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1 ml-6">
                                            {scenario.requirements?.map((req, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckSquare className="h-3 w-3 mt-0.5 text-gray-400 flex-shrink-0" />
                                                    {req}
                                                </li>
                                            )) || (
                                                    <li className="text-gray-500 italic">Requirements will be determined based on your business activity</li>
                                                )}
                                        </ul>
                                    </div>

                                    {scenario.progress?.status === 'completed' && (
                                        <div className="text-sm text-green-600">
                                            ✅ Completed on {new Date(scenario.progress.completion_timestamp!).toLocaleDateString()}
                                        </div>
                                    )}

                                    {scenario.progress?.status === 'failed' && (
                                        <div className="text-sm text-red-600">
                                            ❌ Failed - {scenario.progress.fbr_response}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    {getStatusBadge(scenario.progress?.status || 'not_started')}

                                    <div className="flex gap-2">
                                        {scenario.progress?.status === 'not_started' && (
                                            <Button
                                                onClick={() => handleStartScenario(scenario.scenarioId)}
                                                disabled={!hasValidSandboxKey || testingScenario === scenario.scenarioId}
                                                size="sm"
                                            >
                                                {testingScenario === scenario.scenarioId ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <>
                                                        <Play className="h-4 w-4 mr-1" />
                                                        Start
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {scenario.progress?.status === 'in_progress' && (
                                            <Button
                                                onClick={() => handleTestScenario(scenario.scenarioId)}
                                                disabled={!hasValidSandboxKey || testingScenario === scenario.scenarioId}
                                                size="sm"
                                            >
                                                {testingScenario === scenario.scenarioId ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    <>
                                                        <ArrowRight className="h-4 w-4 mr-1" />
                                                        Test
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {scenario.progress?.status === 'failed' && (
                                            <Button
                                                onClick={() => handleTestScenario(scenario.scenarioId)}
                                                disabled={!hasValidSandboxKey || testingScenario === scenario.scenarioId}
                                                variant="outline"
                                                size="sm"
                                            >
                                                {testingScenario === scenario.scenarioId ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                                ) : (
                                                    <>
                                                        <ArrowRight className="h-4 w-4 mr-1" />
                                                        Retry
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {progressSummary.completionPercentage === 100 && (
                <Card className="p-6 border-green-200 bg-green-50">
                    <div className="text-center space-y-3">
                        <Trophy className="h-12 w-12 text-green-500 mx-auto" />
                        <h3 className="text-xl font-semibold text-green-800">Sandbox Testing Complete!</h3>
                        <p className="text-green-700">
                            All mandatory scenarios have been completed successfully. You can now configure your production API key.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={() => navigate("/fbr/api-config")}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                Configure Production API
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.reload()}
                            >
                                View Certification Summary
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Certification Summary */}
            {progressSummary.completionPercentage === 100 && (
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Certification Summary</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{progressSummary.completed}</div>
                                <div className="text-sm text-gray-600">Scenarios Completed</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{new Date().toLocaleDateString()}</div>
                                <div className="text-sm text-gray-600">Completion Date</div>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Completed Scenarios:</h3>
                            <div className="space-y-2">
                                {scenarios
                                    .filter(s => s.progress?.status === 'completed')
                                    .map(scenario => (
                                        <div key={scenario.scenarioId} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="font-medium">{scenario.scenarioId}:</span>
                                            <span>{scenario.description}</span>
                                            {scenario.progress?.completion_timestamp && (
                                                <span className="text-gray-500 text-xs">
                                                    ({new Date(scenario.progress.completion_timestamp).toLocaleString()})
                                                </span>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
