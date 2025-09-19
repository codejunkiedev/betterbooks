import { useMemo } from "react";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Badge } from "@/shared/components/Badge";
import { Checkbox } from "@/shared/components/Checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import {
  PROVINCES,
  BUSINESS_ACTIVITIES,
  BUSINESS_SECTORS,
  getScenariosForBusinessActivityAndSectorCombinations,
  getScenarioById,
  getCombinationsByActivitiesAndSectors,
} from "@/shared/constants/taxScenarios";

interface FbrProfileProps {
  cnicNtn: string;
  businessName: string;
  provinceCode: string;
  address: string;
  mobileNumber: string;
  activities: string[];
  sectors: string[];
  onFieldChange: (field: string, value: string | string[]) => void;
}

export default function FbrProfile({
  cnicNtn,
  businessName,
  provinceCode,
  address,
  mobileNumber,
  activities,
  sectors,
  onFieldChange,
}: FbrProfileProps) {
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

  const combinationsByActivitiesAndSectors = useMemo(() => {
    return getCombinationsByActivitiesAndSectors(activities, sectors);
  }, [activities, sectors]);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!form.cnic_ntn || !form.cnic_ntn.match(/^\d{7}$|^\d{13}$/)) errs.cnic_ntn = "Enter exactly 7 or 13 digits";
    if (!form.business_name || form.business_name.length > 100) errs.business_name = "Required, max 100 chars";
    if (!form.province_code) errs.province_code = "Province is required";
    if (!form.address || form.address.length > 250) errs.address = "Required, max 250 chars";
    if (!/^\+92\d{10}$/.test(form.mobile_number)) errs.mobile_number = "Format: +92XXXXXXXXXX";
    if (activities.length === 0) errs.activities = "At least one business activity is required";
    if (sectors.length === 0) errs.sectors = "At least one sector is required";
    return errs;
  }, [form, activities, sectors]);

  const handleActivityChange = (activityName: string, checked: boolean) => {
    if (checked) {
      onFieldChange("fbr_activities", [...activities, activityName]);
    } else {
      onFieldChange(
        "fbr_activities",
        activities.filter((a) => a !== activityName)
      );
    }
  };

  const handleSectorChange = (sectorName: string, checked: boolean) => {
    if (checked) {
      onFieldChange("fbr_sectors", [...sectors, sectorName]);
    } else {
      onFieldChange(
        "fbr_sectors",
        sectors.filter((s) => s !== sectorName)
      );
    }
  };

  const applicableScenarios = useMemo(() => {
    if (activities.length === 0 || sectors.length === 0) {
      return [];
    }

    // Get activity IDs from selected activity names
    const selectedActivityIds = activities
      .map((activityName) => BUSINESS_ACTIVITIES.find((a) => a.name === activityName)?.id)
      .filter((id) => id !== undefined) as number[];

    // Get sector IDs from selected sector names
    const selectedSectorIds = sectors
      .map((sectorName) => BUSINESS_SECTORS.find((s) => s.name === sectorName)?.id)
      .filter((id) => id !== undefined) as number[];

    if (selectedActivityIds.length === 0 || selectedSectorIds.length === 0) {
      return [];
    }

    return getScenariosForBusinessActivityAndSectorCombinations(selectedActivityIds, selectedSectorIds);
  }, [activities, sectors]);

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
                {PROVINCES.map((p) => (
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
              <span className="text-xs text-gray-500 ml-2">({activities.length} selected)</span>
            </label>
            <div className="space-y-2 p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
              {BUSINESS_ACTIVITIES.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    id={`activity-${activity.id}`}
                    checked={activities.includes(activity.name)}
                    onCheckedChange={(checked) => handleActivityChange(activity.name, checked as boolean)}
                  />
                  <label htmlFor={`activity-${activity.id}`} className="text-sm font-medium cursor-pointer flex-1">
                    {activity.name}
                  </label>
                  {activity.description && <span className="text-xs text-gray-500">- {activity.description}</span>}
                </div>
              ))}
            </div>

            {errors.activities && <p className="text-red-600 text-xs mt-1">{errors.activities}</p>}
          </div>

          {/* Sectors Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Sectors
              <span className="text-xs text-gray-500 ml-2">({sectors.length} selected)</span>
            </label>
            <div className="space-y-2 p-4 border rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
              {BUSINESS_SECTORS.map((sector) => (
                <div
                  key={sector.id}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  <Checkbox
                    id={`sector-${sector.id}`}
                    checked={sectors.includes(sector.name)}
                    onCheckedChange={(checked) => handleSectorChange(sector.name, checked as boolean)}
                  />
                  <label htmlFor={`sector-${sector.id}`} className="text-sm font-medium cursor-pointer flex-1">
                    {sector.name}
                  </label>
                  {sector.description && (
                    <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">{sector.description}</span>
                  )}
                </div>
              ))}
            </div>
            {errors.sectors && <p className="text-red-600 text-xs mt-1">{errors.sectors}</p>}
          </div>

          {/* Selected Combinations */}
          {combinationsByActivitiesAndSectors.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Selected Combinations
                <span className="text-xs text-gray-500 ml-2">
                  ({combinationsByActivitiesAndSectors.length} combinations)
                </span>
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {combinationsByActivitiesAndSectors.map((combination, index) => (
                  <div
                    key={`combination-${combination.businessActivity}-${combination.sector}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {combination.businessActivity}
                      </Badge>
                      <span className="text-gray-400">×</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {combination.sector}
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
