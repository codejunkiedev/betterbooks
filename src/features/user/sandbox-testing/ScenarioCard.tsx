import React from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Badge } from "@/shared/components/Badge";
import { Play, Tag, CheckCircle } from "lucide-react";
import { TaxScenario } from "@/shared/constants";

interface ScenarioCardProps {
  scenario: TaxScenario;
  onStartScenario: (scenario: TaxScenario) => void;
  isApiConfigured?: boolean;
  isSubmittedToFBR?: boolean;
}

export function ScenarioCard({
  scenario,
  onStartScenario,
  isApiConfigured = true,
  isSubmittedToFBR = true,
}: ScenarioCardProps) {
  return (
    <Card className={`h-full border-l-4 flex flex-col ${isSubmittedToFBR ? "border-l-green-500 bg-green-50/50" : ""}`}>
      <div className="p-6 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="space-y-3 flex-1">
          {/* Title with completion badge */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold text-foreground leading-tight flex-1">
              {scenario.id} - {scenario.description}
            </h3>
            {isSubmittedToFBR && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white shrink-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Submitted
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Sale Type:</span>
              <span className="capitalize bg-muted px-2 py-1 rounded text-foreground">{scenario.saleType}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 mt-auto">
          <Button onClick={() => onStartScenario(scenario)} disabled={!isApiConfigured} className="w-full" size="lg">
            <div className="flex items-center gap-2">
              {React.createElement(Play, { className: "h-4 w-4" })}
              <span>Start Scenario</span>
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
}
