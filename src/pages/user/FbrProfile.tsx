import { useEffect, useMemo, useState } from "react";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Badge } from "@/shared/components/Badge";
import { Checkbox } from "@/shared/components/Checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import {
  PROVINCES,
  BUSINESS_ACTIVITY_TYPES,
  SECTORS,
  getAvailableSectorsForBusinessActivities,
  getScenariosForBusinessActivityAndSectorCombinations,
  getScenarioById,
  Sector,
} from "@/shared/constants/taxScenarios";
import { UserBusinessActivitySelection } from "@/shared/types/fbr";

interface FbrProfileNewProps {
  cnicNtn: string;
  businessName: string;
  provinceCode: string;
  address: string;
  mobileNumber: string;
  businessActivitySelection: UserBusinessActivitySelection;
  onFieldChange: (field: string, value: string | UserBusinessActivitySelection) => void;
}

export default function FbrProfileNew({
  cnicNtn,
  businessName,
  provinceCode,
  address,
  mobileNumber,
  businessActivitySelection,
  onFieldChange,
}: FbrProfileNewProps) {
  const [availableSectors, setAvailableSectors] = useState<Sector[]>([]);
  const [applicableScenarios, setApplicableScenarios] = useState<string[]>([]);

  const provinces = PROVINCES;
  const businessActivityTypes = BUSINESS_ACTIVITY_TYPES;
  const allSectors = SECTORS;

  const form = useMemo(
    () => ({
      cnic_ntn: cnicNtn,
      business_name: businessName,
      province_code: provinceCode,
      address: address,
      mobile_number: mobileNumber,
    }),
    [cnicNtn, businessName, provinceCode, address, mobileNumber]
  );

  // Ensure combinations have proper business activity and sector names
  const enrichedCombinations = useMemo(() => {
    return businessActivitySelection.combinations.map((combination) => {
      const activity = businessActivityTypes.find((a) => a.id === combination.business_activity_type_id);
      const sector = allSectors.find((s) => s.id === combination.sector_id);

      return {
        ...combination,
        business_activity_name: activity?.name || combination.business_activity_name || "Unknown Activity",
        business_activity_description: activity?.description || combination.business_activity_description,
        sector_name: sector?.name || combination.sector_name || "Unknown Sector",
        sector_description: sector?.description || combination.sector_description,
      };
    });
  }, [businessActivitySelection.combinations, businessActivityTypes, allSectors]);

  // No need to load initial data from API anymore - using constants

  // Load available sectors when business activities change
  useEffect(() => {
    if (businessActivitySelection.business_activity_type_ids.length > 0) {
      const sectors = getAvailableSectorsForBusinessActivities(businessActivitySelection.business_activity_type_ids);
      setAvailableSectors(sectors);
    } else {
      setAvailableSectors([]);
    }
  }, [businessActivitySelection.business_activity_type_ids]);

  // Load applicable scenarios when both business activities and sectors are selected
  useEffect(() => {
    if (
      businessActivitySelection.business_activity_type_ids.length > 0 &&
      businessActivitySelection.sector_ids.length > 0
    ) {
      const scenarios = getScenariosForBusinessActivityAndSectorCombinations(
        businessActivitySelection.business_activity_type_ids,
        businessActivitySelection.sector_ids
      );
      setApplicableScenarios(scenarios);
    } else {
      setApplicableScenarios([]);
    }
  }, [businessActivitySelection.business_activity_type_ids, businessActivitySelection.sector_ids]);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!form.cnic_ntn || !form.cnic_ntn.match(/^\d{7}$|^\d{13}$/)) errs.cnic_ntn = "Enter exactly 7 or 13 digits";
    if (!form.business_name || form.business_name.length > 100) errs.business_name = "Required, max 100 chars";
    if (!form.province_code) errs.province_code = "Province is required";
    if (!form.address || form.address.length > 250) errs.address = "Required, max 250 chars";
    if (!/^\+92\d{10}$/.test(form.mobile_number)) errs.mobile_number = "Format: +92XXXXXXXXXX";
    if (businessActivitySelection.business_activity_type_ids.length === 0)
      errs.business_activities = "At least one business activity is required";
    if (
      businessActivitySelection.business_activity_type_ids.length > 0 &&
      businessActivitySelection.sector_ids.length === 0
    ) {
      errs.sectors = "At least one sector is required when business activities are selected";
    }
    if (
      businessActivitySelection.combinations.length === 0 &&
      businessActivitySelection.business_activity_type_ids.length > 0 &&
      businessActivitySelection.sector_ids.length > 0
    ) {
      errs.combinations = "No valid combinations found for selected business activities and sectors";
    }
    return errs;
  }, [form, businessActivitySelection]);

  const handleBusinessActivityChange = (activityId: number, checked: boolean) => {
    const newActivityIds = checked
      ? [...businessActivitySelection.business_activity_type_ids, activityId]
      : businessActivitySelection.business_activity_type_ids.filter((id) => id !== activityId);

    // Clear sectors when business activities change
    const updatedSelection: UserBusinessActivitySelection = {
      ...businessActivitySelection,
      business_activity_type_ids: newActivityIds,
      sector_ids: [],
      combinations: [],
    };

    onFieldChange("fbr_business_activity_selection", updatedSelection);
  };

  const handleSectorChange = (sectorId: number, checked: boolean) => {
    const newSectorIds = checked
      ? [...businessActivitySelection.sector_ids, sectorId]
      : businessActivitySelection.sector_ids.filter((id) => id !== sectorId);

    // Generate combinations based on selected business activities and sectors
    const combinations: UserBusinessActivitySelection["combinations"] = [];
    for (const activityId of businessActivitySelection.business_activity_type_ids) {
      for (const sectorId of newSectorIds) {
        const activity = businessActivityTypes.find((a) => a.id === activityId);
        const sector = allSectors.find((s) => s.id === sectorId);
        if (activity && sector) {
          combinations.push({
            business_activity_type_id: activity.id,
            business_activity_name: activity.name,
            business_activity_description: activity?.description || null,
            sector_id: sector.id,
            sector_name: sector.name,
            sector_description: sector?.description || null,
            is_primary: false,
          });
        }
      }
    }

    const updatedSelection: UserBusinessActivitySelection = {
      ...businessActivitySelection,
      sector_ids: newSectorIds,
      combinations,
    };

    onFieldChange("fbr_business_activity_selection", updatedSelection);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <CardTitle>FBR Profile Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium mb-1">CNIC/NTN</label>
            <Input
              value={form.cnic_ntn}
              onChange={(e) => onFieldChange("fbr_cnic_ntn", e.target.value.replace(/\D/g, ""))}
              maxLength={13}
              className={errors.cnic_ntn ? "border-red-500" : undefined}
            />
            {errors.cnic_ntn && <p className="text-red-600 text-xs mt-1">{errors.cnic_ntn}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Business Name</label>
            <Input
              value={form.business_name}
              onChange={(e) => onFieldChange("fbr_business_name", e.target.value)}
              maxLength={100}
              className={errors.business_name ? "border-red-500" : undefined}
            />
            {errors.business_name && <p className="text-red-600 text-xs mt-1">{errors.business_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Province</label>
            <Select value={form.province_code} onValueChange={(v) => onFieldChange("fbr_province_code", v)}>
              <SelectTrigger className={errors.province_code ? "border-red-500" : undefined}>
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((p) => (
                  <SelectItem key={p.state_province_code} value={String(p.state_province_code)}>
                    {p.state_province_desc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.province_code && <p className="text-red-600 text-xs mt-1">{errors.province_code}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Textarea
              value={form.address}
              onChange={(e) => onFieldChange("fbr_address", e.target.value)}
              maxLength={250}
              className={errors.address ? "border-red-500" : undefined}
            />
            {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <Input
              value={form.mobile_number}
              onChange={(e) => onFieldChange("fbr_mobile_number", e.target.value)}
              placeholder="+92XXXXXXXXXX"
              className={errors.mobile_number ? "border-red-500" : undefined}
            />
            {errors.mobile_number && <p className="text-red-600 text-xs mt-1">{errors.mobile_number}</p>}
          </div>

          {/* Business Activities Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Business Activities
              <span className="text-xs text-gray-500 ml-2">
                ({businessActivitySelection.business_activity_type_ids.length} selected)
              </span>
            </label>
            <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
              {businessActivityTypes.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    id={`activity-${activity.id}`}
                    checked={businessActivitySelection.business_activity_type_ids.includes(activity.id)}
                    onCheckedChange={(checked) => handleBusinessActivityChange(activity.id, checked as boolean)}
                  />
                  <label htmlFor={`activity-${activity.id}`} className="text-sm font-medium cursor-pointer flex-1">
                    {activity.name}
                  </label>
                  {activity.description && <span className="text-xs text-gray-500">- {activity.description}</span>}
                </div>
              ))}
            </div>
            {errors.business_activities && <p className="text-red-600 text-xs mt-1">{errors.business_activities}</p>}
          </div>

          {/* Sectors Selection */}
          {businessActivitySelection.business_activity_type_ids.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Available Sectors
                <span className="text-xs text-gray-500 ml-2">
                  ({businessActivitySelection.sector_ids.length} selected)
                </span>
              </label>
              <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                {availableSectors.length > 0 ? (
                  availableSectors.map((sector, index) => (
                    <div
                      key={`sector-${sector.id}-${index}`}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Checkbox
                        id={`sector-${sector.id}-${index}`}
                        checked={businessActivitySelection.sector_ids.includes(sector.id)}
                        onCheckedChange={(checked) => handleSectorChange(sector.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`sector-${sector.id}-${index}`}
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {sector.name}
                      </label>
                      {sector.description && (
                        <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                          {sector.description}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No sectors available for selected business activities</p>
                )}
              </div>
              {errors.sectors && <p className="text-red-600 text-xs mt-1">{errors.sectors}</p>}
            </div>
          )}

          {/* Selected Combinations */}
          {enrichedCombinations.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Selected Combinations
                <span className="text-xs text-gray-500 ml-2">({enrichedCombinations.length} combinations)</span>
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {enrichedCombinations.map((combination, index) => (
                  <div
                    key={`combination-${combination.business_activity_type_id}-${combination.sector_id}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {combination.business_activity_name}
                      </Badge>
                      <span className="text-gray-400">×</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {combination.sector_name}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applicable Scenarios */}
          {applicableScenarios.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Applicable Scenarios
                <span className="text-xs text-gray-500 ml-2">
                  ({applicableScenarios.length} scenarios will be available)
                </span>
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {applicableScenarios.map((scenarioId, index) => {
                  const scenario = getScenarioById(scenarioId);
                  return (
                    <div
                      key={`scenario-${scenarioId}-${index}`}
                      className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 shadow-sm"
                    >
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 font-mono">
                          {scenarioId}
                        </Badge>
                        <span className="text-sm text-gray-600">{scenario?.description || "Unknown scenario"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These scenarios will be available for testing based on your selected business activities and sectors.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
