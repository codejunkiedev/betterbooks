import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "@/shared/services/store";
import { useToast } from "@/shared/hooks/useToast";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Alert, AlertDescription } from "@/shared/components/Alert";
import { SearchModal, SandboxSearchFilters } from "./SearchModal";
import { ScenarioCard } from "./ScenarioCard";
import {
    AlertCircle,
    FileText,
    Award,
    ExternalLink
} from "lucide-react";
import type { FbrScenario } from "@/shared/types/fbr";
import {
    getFilteredMandatoryScenarios,
    getUserBusinessActivityId,
    updateScenarioProgress
} from '@/shared/services/supabase/fbr';
import { FBR_API_STATUS, FBR_SCENARIO_STATUS } from "@/shared/constants/fbr";

export default function SandboxTesting() {
    const { user } = useSelector((s: RootState) => s.user);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [scenarios, setScenarios] = useState<FbrScenario[]>([]);
    const [filteredScenarios, setFilteredScenarios] = useState<FbrScenario[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchFilters, setSearchFilters] = useState<SandboxSearchFilters>({
        searchTerm: "",
        category: "",
        saleType: "",
        scenarioId: ""
    });

    const [hasValidSandboxKey, setHasValidSandboxKey] = useState(false);
    const [isAllCompleted, setIsAllCompleted] = useState(false);

    const loadScenarios = useCallback(async (filters?: SandboxSearchFilters) => {
        if (!user?.id) return;

        try {
            setLoading(true);

            const businessActivityId = await getUserBusinessActivityId(user.id);

            if (!businessActivityId) {
                toast({
                    title: "No Business Activity",
                    description: "Please complete your business profile first.",
                    variant: "destructive"
                });

                return; // finally block will unset loading
            }

            const filteredScenariosData = await getFilteredMandatoryScenarios(
                businessActivityId,
                user.id,
                filters || {}
            );

            if (!filteredScenariosData || filteredScenariosData.length === 0) {
                setFilteredScenarios([]);
                if (!filters) {
                    setScenarios([]);
                }
                setLoading(false);
                return;
            }

            const scenariosWithProgress = filteredScenariosData
                .filter(scenario => scenario?.code)
                .map(scenario => scenario as FbrScenario);

            setFilteredScenarios(scenariosWithProgress);

            if (!filters) {
                setScenarios(scenariosWithProgress);
            }

            // Check if all scenarios are completed
            const allCompleted = scenariosWithProgress.length > 0 &&
                scenariosWithProgress.every(scenario => scenario.status === FBR_SCENARIO_STATUS.COMPLETED);
            setIsAllCompleted(allCompleted);

            // Only check FBR config if we don't already have the status
            if (hasValidSandboxKey === false) {
                const { getFbrConfigStatus } = await import("@/shared/services/supabase/fbr");
                const config = await getFbrConfigStatus(user.id);
                const hasValidKey = config.sandbox_status === FBR_API_STATUS.CONNECTED && !!config.sandbox_api_key;
                setHasValidSandboxKey(hasValidKey);
            }

        } catch {
            toast({
                title: "Error",
                description: "Failed to load scenarios. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [user?.id, toast, hasValidSandboxKey]);

    // Load scenarios on component mount
    useEffect(() => {
        loadScenarios();
    }, [loadScenarios]);

    useEffect(() => {
        if (location.state?.refresh) {
            loadScenarios();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, loadScenarios, location.pathname, navigate]);

    const handleStartScenario = async (scenario: FbrScenario) => {
        if (!user?.id) return;

        if (!hasValidSandboxKey) {
            toast({
                title: "API Not Configured",
                description: "Please configure your FBR sandbox API key before starting scenarios.",
                variant: "destructive"
            });
            return;
        }

        try {
            // Create or update progress entry with "in_progress" status
            await updateScenarioProgress(
                user.id,
                scenario.id,
                FBR_SCENARIO_STATUS.IN_PROGRESS
            );

            // Navigate to the scenario form
            navigate(`/fbr/sandbox-testing/scenario/${scenario.code}`);
        } catch (error) {
            console.error('Error starting scenario:', error);
            toast({
                title: "Error",
                description: "Failed to start scenario. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleSearchModalSearch = () => {
        loadScenarios(searchFilters);
    };

    const handleClearSearchFilters = () => {
        setSearchFilters({
            searchTerm: "",
            category: "",
            saleType: "",
            scenarioId: ""
        });
        loadScenarios();
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (searchFilters.searchTerm) count++;
        if (searchFilters.category) count++;
        if (searchFilters.saleType) count++;
        if (searchFilters.scenarioId) count++;
        return count;
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="space-y-3">
                    <div className="h-9 bg-gray-200 rounded-md w-80 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-md w-96 animate-pulse"></div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start space-x-3">
                        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                    </div>
                </div>

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

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                        <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                    </div>
                </div>

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
                <p className="text-gray-500 text-lg">Start testing your FBR integration with these mandatory scenarios.</p>
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



            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Mandatory Test Scenarios</h2>
                    <SearchModal
                        filters={searchFilters}
                        setFilters={setSearchFilters}
                        scenarios={scenarios}
                        onSearch={handleSearchModalSearch}
                        onClearFilters={handleClearSearchFilters}
                    />
                </div>

                {/* Progress Indicator */}
                {scenarios.length > 0 && (
                    <Card className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Overall Progress</h3>
                                <span className="text-2xl font-bold text-green-600">
                                    {Math.round((scenarios.filter(s => s.status === FBR_SCENARIO_STATUS.COMPLETED).length / scenarios.length) * 100)}%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                    className="bg-green-600 h-3 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${(scenarios.filter(s => s.status === FBR_SCENARIO_STATUS.COMPLETED).length / scenarios.length) * 100}%`
                                    }}
                                ></div>
                            </div>

                            {/* Status Breakdown */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-600">
                                        {scenarios.filter(s => s.status === FBR_SCENARIO_STATUS.NOT_STARTED).length}
                                    </div>
                                    <div className="text-sm text-gray-500">Not Started</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {scenarios.filter(s => s.status === FBR_SCENARIO_STATUS.IN_PROGRESS).length}
                                    </div>
                                    <div className="text-sm text-blue-500">In Progress</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {scenarios.filter(s => s.status === FBR_SCENARIO_STATUS.COMPLETED).length}
                                    </div>
                                    <div className="text-sm text-green-500">Completed</div>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">
                                        {scenarios.filter(s => s.status === FBR_SCENARIO_STATUS.FAILED).length}
                                    </div>
                                    <div className="text-sm text-red-500">Failed</div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Sandbox Testing Complete State */}
                {isAllCompleted && (
                    <Card className="p-6 border-green-200 bg-green-50">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Award className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-green-800 mb-2">
                                    Sandbox Testing Complete! 🎉
                                </h3>
                                <p className="text-green-700 mb-4">
                                    Congratulations! You have successfully completed all mandatory FBR sandbox scenarios.
                                    You are now ready to configure your production API key and start using FBR in production.
                                </p>
                            </div>

                            {/* Certification Summary */}
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-3">Certification Summary</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{scenarios.length}</div>
                                        <div className="text-green-700">Scenarios Completed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">100%</div>
                                        <div className="text-green-700">Success Rate</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {new Date().toLocaleDateString()}
                                        </div>
                                        <div className="text-green-700">Certification Date</div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={() => navigate("/fbr/api-config")}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Configure Production API Key
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.print()}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Print Certificate
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {(searchFilters.searchTerm || getActiveFiltersCount() > 0) && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredScenarios.length} of {scenarios.length} scenarios
                        </p>
                    </div>
                )}
            </div>

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
                            key={scenario.id}
                            scenario={scenario}
                            onStartScenario={handleStartScenario}
                            isApiConfigured={hasValidSandboxKey}
                        />
                    ))
                )}
            </div>




        </div>
    );
}
