import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "@/shared/services/store";
import { useToast } from "@/shared/hooks/useToast";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Progress } from "@/shared/components/Progress";
import { Alert, AlertDescription } from "@/shared/components/Alert";
import { SearchModal, SandboxSearchFilters } from "./SearchModal";
import { ScenarioCard } from "./ScenarioCard";
import {
    CheckCircle,
    AlertCircle,
    Trophy,
    FileText
} from "lucide-react";
import type { FbrScenarioWithProgress } from "@/shared/types/fbr";
import {
    getUserBusinessActivityId,
    getFilteredMandatoryScenarios,
    getScenarioProgressSummary,
    updateScenarioProgress
} from "@/shared/services/supabase/fbr";
import { FBR_API_STATUS } from "@/shared/constants/fbr";

export default function SandboxTesting() {
    const { user } = useSelector((s: RootState) => s.user);
    const { toast } = useToast();
    const navigate = useNavigate();

    const [scenarios, setScenarios] = useState<FbrScenarioWithProgress[]>([]);
    const [filteredScenarios, setFilteredScenarios] = useState<FbrScenarioWithProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchFilters, setSearchFilters] = useState<SandboxSearchFilters>({
        searchTerm: "",
        status: "",
        category: "",
        saleType: "",
        scenarioId: ""
    });
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

    useEffect(() => {
        loadScenarios();
    }, []);

    const loadScenarios = async (filters?: SandboxSearchFilters) => {
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

            // Get filtered scenarios from backend
            const filteredScenariosData = await getFilteredMandatoryScenarios(
                businessActivityId,
                filters || {},
                user.id
            );

            // Handle case where no scenarios are returned
            if (!filteredScenariosData || filteredScenariosData.length === 0) {
                setFilteredScenarios([]);
                if (!filters) {
                    setScenarios([]);
                }
                setLoading(false);
                return;
            }

            // Create scenarios with progress using database data
            const scenariosWithProgress = filteredScenariosData
                .filter(scenarioData => scenarioData && scenarioData.scenario) // Filter out null scenarios
                .map((scenarioData) => {
                    return {
                        scenarioId: scenarioData.scenario?.code || 'UNKNOWN',
                        description: scenarioData.scenario?.description || 'No description available',
                        saleType: scenarioData.scenario?.sale_type || 'Unknown',
                        category: scenarioData.scenario?.category || 'Unknown',
                        progress: scenarioData.progress
                    } as FbrScenarioWithProgress;
                });

            setFilteredScenarios(scenariosWithProgress);

            // If this is the initial load (no filters), also set the full scenarios list
            if (!filters) {
                setScenarios(scenariosWithProgress);
            }

            // Get progress summary
            const summary = await getScenarioProgressSummary(user.id);
            setProgressSummary(summary);

            // Check if user has valid sandbox key
            const { getFbrConfigStatus } = await import("@/shared/services/supabase/fbr");
            const config = await getFbrConfigStatus(user.id);
            const hasValidKey = config.sandbox_status === FBR_API_STATUS.CONNECTED && !!config.sandbox_api_key;
            setHasValidSandboxKey(hasValidKey);

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

            // Navigate to the invoice creation form
            navigate(`/fbr/sandbox-testing/scenario/${scenarioId}`);

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
        // Navigate to the invoice creation form for this scenario
        navigate(`/fbr/sandbox-testing/scenario/${scenarioId}`);
    };

    // Temporary function to enable sandbox testing (for development only)
    const enableSandboxTesting = async () => {
        if (!user?.id) return;

        try {
            const { saveFbrCredentials, updateFbrConnectionStatus } = await import("@/shared/services/supabase/fbr");

            // Save a dummy sandbox key (replace with real key for production)
            await saveFbrCredentials(user.id, 'dummy-sandbox-key-for-testing');

            // Update status to connected (bypass API test for development)
            await updateFbrConnectionStatus(user.id, 'sandbox', 'connected');

            // Reload scenarios to update the button state
            await loadScenarios();

            toast({
                title: "Success",
                description: "Sandbox testing enabled for development (bypassed API test)",
            });
        } catch (error) {
            console.error('Error enabling sandbox testing:', error);
            toast({
                title: "Error",
                description: "Failed to enable sandbox testing",
                variant: "destructive"
            });
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

    const handleSearchModalSearch = () => {
        // Load scenarios with current filters from backend
        loadScenarios(searchFilters);
    };

    const handleClearSearchFilters = () => {
        setSearchFilters({
            searchTerm: "",
            status: "",
            category: "",
            saleType: "",
            scenarioId: ""
        });
        // Reload all scenarios when filters are cleared
        loadScenarios();
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchFilters.searchTerm) count++;
        if (searchFilters.status) count++;
        if (searchFilters.category) count++;
        if (searchFilters.saleType) count++;
        if (searchFilters.scenarioId) count++;
        return count;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6 space-y-6">
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

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg space-y-2">
                                    <div className="h-8 bg-gray-200 rounded-md w-8 mx-auto animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded-md w-20 mx-auto animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                    </div>
                </div>

                {/* Scenarios List Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-6 h-fit">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded-md w-2 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded-md w-2 animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded-md w-12 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="h-3 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                                    </div>
                                    <div className="ml-5 space-y-2">
                                        {[...Array(2)].map((_, j) => (
                                            <div key={j} className="flex items-start gap-2">
                                                <div className="h-2.5 w-2.5 bg-gray-200 rounded-full animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-9 bg-gray-200 rounded-md w-full animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
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

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{progressSummary.completed}</div>
                            <div className="text-gray-500">Completed</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{progressSummary.inProgress}</div>
                            <div className="text-gray-500">In Progress</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{progressSummary.failed}</div>
                            <div className="text-gray-500">Failed</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-600">{progressSummary.notStarted}</div>
                            <div className="text-gray-500">Not Started</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Filters Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Mandatory Test Scenarios</h2>
                    <div className="flex items-center gap-2">
                        {/* Temporary button for development - remove in production */}
                        {!hasValidSandboxKey && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={enableSandboxTesting}
                                className="text-xs"
                            >
                                Enable Testing (Dev)
                            </Button>
                        )}
                        <SearchModal
                            filters={searchFilters}
                            setFilters={setSearchFilters}
                            scenarios={scenarios}
                            onSearch={handleSearchModalSearch}
                            onClearFilters={handleClearSearchFilters}
                        />
                    </div>
                </div>
                {(searchFilters.searchTerm || getActiveFiltersCount() > 0) && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredScenarios.length} of {scenarios.length} scenarios
                        </p>
                    </div>
                )}
            </div>

            {/* Scenarios List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
                {filteredScenarios.length === 0 ? (
                    <Card className="p-6 text-center md:col-span-2">
                        <div className="space-y-2">
                            <FileText className="h-8 w-8 text-gray-400 mx-auto" />
                            <h3 className="text-lg font-medium text-gray-900">No scenarios found</h3>
                            <p className="text-gray-500">
                                {searchFilters.searchTerm
                                    ? `No scenarios match "${searchFilters.searchTerm}". Try adjusting your filters.`
                                    : "No scenarios available for your business activity."
                                }
                            </p>
                            {searchFilters.searchTerm && (
                                <Button
                                    variant="outline"
                                    onClick={() => setSearchFilters({ ...searchFilters, searchTerm: "" })}
                                    className="mt-2"
                                >
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    </Card>
                ) : (
                    filteredScenarios.map((scenario) => (
                        <ScenarioCard
                            key={scenario.scenarioId}
                            scenario={scenario}
                            hasValidSandboxKey={hasValidSandboxKey}
                            testingScenario={testingScenario}
                            onStartScenario={handleStartScenario}
                            onTestScenario={handleTestScenario}
                        />
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
