import React from "react";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Play, Tag } from "lucide-react";
import { TaxScenario } from "@/shared/constants";

interface ScenarioCardProps {
  scenario: TaxScenario;
  onStartScenario: (scenario: TaxScenario) => void;
  isApiConfigured?: boolean;
}

export function ScenarioCard({ scenario, onStartScenario, isApiConfigured = true }: ScenarioCardProps) {
  return (
    <Card className={`h-full border-l-4 flex flex-col`}>
      <div className="p-6 flex-1 flex flex-col">
        {/* Header Section */}
        <div className="space-y-3 flex-1">
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground leading-tight">{scenario.description}</h3>

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
