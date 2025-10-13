import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { RootState } from "@/shared/services/store";
import { useToast } from "@/shared/hooks/useToast";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Alert, AlertDescription } from "@/shared/components/Alert";
import { ScenarioCard } from "./ScenarioCard";
import { AlertCircle, FileText, Search } from "lucide-react";
import { getFbrConfigStatus, getFbrProfileByUser, getUserSuccessfulScenarios } from "@/shared/services/supabase/fbr";
import { FBR_API_STATUS } from "@/shared/constants/fbr";
import { getTaxScenariosByBusinessActivityAndSector, TaxScenario } from "@/shared/constants";
import { FbrEnvironment } from "@/shared/types/fbr";

type SandboxTestingProps = {
  environment?: FbrEnvironment;
};

export default function SandboxTesting({ environment = "sandbox" }: SandboxTestingProps) {
  const { user } = useSelector((s: RootState) => s.user);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [scenarios, setScenarios] = useState<TaxScenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasValidApiKey, setHasValidApiKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [successfulScenarios, setSuccessfulScenarios] = useState<string[]>([]);

  const isSandbox = environment === "sandbox" || false;

  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;
        setLoading(true);
        if (hasValidApiKey === false) {
          const config = await getFbrConfigStatus(user.id);
          const status = isSandbox ? config.sandbox_status : config.production_status;
          const apiKey = isSandbox ? config.sandbox_api_key : config.production_api_key;
          const hasValidKey = status === FBR_API_STATUS.CONNECTED && !!apiKey;
          setHasValidApiKey(hasValidKey);
        }
      } catch (error) {
        console.error("Error checking FBR config status:", error);
        toast({
          title: "Error",
          description: "Failed to check FBR config status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [hasValidApiKey, toast, user?.id, isSandbox]);

  useEffect(() => {
    (async () => {
      try {
        if (!user?.id || !hasValidApiKey) return;
        setLoading(true);
        const fbrProfile = await getFbrProfileByUser(user.id);
        const { activities, sectors } = fbrProfile || {};
        if (!activities?.length || !sectors?.length) {
          toast({
            title: "No Business Activities",
            description: "Please complete your business profile with business activities and sectors first.",
            variant: "destructive",
          });
          return;
        }
        const scenarios = getTaxScenariosByBusinessActivityAndSector(activities, sectors);
        if (!scenarios?.length) {
          toast({
            title: "No Scenarios",
            description: "No scenarios found for your selected business activities and sectors.",
            variant: "destructive",
          });
          return;
        }
        setScenarios(scenarios);
      } catch (error) {
        console.error("Error loading scenarios:", error);
        toast({
          title: "Error",
          description: "Failed to load scenarios. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [hasValidApiKey, toast, user?.id]);

  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;
        const successful = await getUserSuccessfulScenarios(user.id);
        setSuccessfulScenarios(successful);
      } catch (error) {
        console.error("Error loading successful scenarios:", error);
      }
    })();
  }, [user?.id, location.state?.refresh]);

  const filteredScenarios = useMemo(() => {
    if (!searchQuery.trim()) return scenarios;

    const query = searchQuery.toLowerCase().trim();
    return scenarios.filter(
      (scenario) =>
        scenario.id.toLowerCase().includes(query) ||
        scenario.description.toLowerCase().includes(query) ||
        scenario.saleType.toLowerCase().includes(query)
    );
  }, [scenarios, searchQuery]);

  const handleStartScenario = async (scenario: TaxScenario) => {
    if (!user?.id) return;
    if (!hasValidApiKey) {
      toast({
        title: "API Not Configured",
        description: `Please configure your FBR ${
          isSandbox ? "sandbox" : "production"
        } API key before starting scenarios.`,
        variant: "destructive",
      });
      return;
    }
    if (isSandbox) {
      navigate(`/fbr/sandbox-testing/scenario/${scenario.id}`);
    } else {
      navigate(`/fbr/live-invoices/scenario/${scenario.id}`);
    }
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
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">FBR {isSandbox ? "Sandbox Testing" : "Live Invoices"}</h1>
          <p className="text-gray-500 text-lg">
            {isSandbox
              ? "Start testing your FBR integration with these mandatory scenarios."
              : "Create and submit live invoices to FBR. Use production API keys with caution."}
          </p>
        </div>
        {scenarios.length > 0 && (
          <div className="flex-shrink-0 w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {!hasValidApiKey && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You need to configure a valid {isSandbox ? "sandbox" : "production"} API key to test scenarios.{" "}
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

      {searchQuery && scenarios.length > 0 && (
        <div className="text-sm text-gray-600">
          Showing {filteredScenarios.length} of {scenarios.length} scenarios
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {scenarios.length === 0 ? (
          <Card className="p-6 text-center md:col-span-2">
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-gray-400 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">No scenarios found</h3>
              <p className="text-gray-500">
                No scenarios available for your selected business activities and sectors. Please complete your business
                profile first.
              </p>
            </div>
          </Card>
        ) : filteredScenarios.length === 0 && searchQuery ? (
          <Card className="p-6 text-center md:col-span-2">
            <div className="space-y-2">
              <Search className="h-8 w-8 text-gray-400 mx-auto" />
              <h3 className="text-lg font-medium text-gray-900">No matching scenarios</h3>
              <p className="text-gray-500">No scenarios match your search criteria. Try a different search term.</p>
            </div>
          </Card>
        ) : (
          filteredScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onStartScenario={handleStartScenario}
              isApiConfigured={hasValidApiKey}
              isSubmittedToFBR={successfulScenarios.includes(scenario.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
