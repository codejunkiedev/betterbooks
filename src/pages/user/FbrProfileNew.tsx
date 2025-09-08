import { useEffect, useMemo, useState } from "react";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Badge } from "@/shared/components/Badge";
import { Checkbox } from "@/shared/components/Checkbox";
import { useToast } from "@/shared/hooks/useToast";
import {
    getProvinceCodes,
    getBusinessActivityTypes,
    getSectors,
    getAvailableSectorsForActivities,
    getScenariosForCombinations
} from "@/shared/services/supabase/fbr";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import {
    BusinessActivityType,
    Sector,
    UserBusinessActivitySelection,
    BusinessActivitySectorCombination
} from "@/shared/types/fbr";

interface Province {
    state_province_code: number;
    state_province_desc: string;
}

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
    onFieldChange
}: FbrProfileNewProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [availableSectors, setAvailableSectors] = useState<Array<{
        sector_id: number;
        sector_name: string;
        business_activity: string;
    }>>([]);
    const [applicableScenarios, setApplicableScenarios] = useState<Array<{
        scenario_id: number;
        scenario_code: string;
        business_activity: string;
        sector: string;
    }>>([]);

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [businessActivityTypes, setBusinessActivityTypes] = useState<BusinessActivityType[]>([]);
    const [allSectors, setAllSectors] = useState<Sector[]>([]);

    const form = useMemo(() => ({
        cnic_ntn: cnicNtn,
        business_name: businessName,
        province_code: provinceCode,
        address: address,
        mobile_number: mobileNumber,
    }), [cnicNtn, businessName, provinceCode, address, mobileNumber]);

    // Load initial data
    useEffect(() => {
        const run = async () => {
            try {
                const [
                    { data: provData, error: provErr },
                    { data: actData, error: actErr },
                    { data: secData, error: secErr }
                ] = await Promise.all([
                    getProvinceCodes(),
                    getBusinessActivityTypes(),
                    getSectors(),
                ]);

                if (provErr) throw provErr;
                if (actErr) throw actErr;
                if (secErr) throw secErr;

                setProvinces(provData || []);
                setBusinessActivityTypes(actData || []);
                setAllSectors(secData || []);
            } catch (e) {
                console.error(e);
                toast({ title: "Error", description: "Failed to load FBR profile data.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [toast]);

    // Load available sectors when business activities change
    useEffect(() => {
        const loadAvailableSectors = async () => {
            if (businessActivitySelection.business_activity_ids.length > 0) {
                try {
                    const { data } = await getAvailableSectorsForActivities(businessActivitySelection.business_activity_ids);
                    setAvailableSectors(data || []);
                } catch (error) {
                    console.error('Error loading available sectors:', error);
                    toast({ title: "Error", description: "Failed to load available sectors.", variant: "destructive" });
                }
            } else {
                setAvailableSectors([]);
            }
        };

        loadAvailableSectors();
    }, [businessActivitySelection.business_activity_ids, toast]);

    // Load applicable scenarios when both business activities and sectors are selected
    useEffect(() => {
        const loadApplicableScenarios = async () => {
            if (businessActivitySelection.business_activity_ids.length > 0 && businessActivitySelection.sector_ids.length > 0) {
                try {
                    const { data } = await getScenariosForCombinations(
                        businessActivitySelection.business_activity_ids,
                        businessActivitySelection.sector_ids
                    );
                    setApplicableScenarios(data || []);
                } catch (error) {
                    console.error('Error loading applicable scenarios:', error);
                    toast({ title: "Error", description: "Failed to load applicable scenarios.", variant: "destructive" });
                }
            } else {
                setApplicableScenarios([]);
            }
        };

        loadApplicableScenarios();
    }, [businessActivitySelection.business_activity_ids, businessActivitySelection.sector_ids, toast]);

    const errors = useMemo(() => {
        const errs: Record<string, string> = {};
        if (!form.cnic_ntn || !form.cnic_ntn.match(/^\d{7}$|^\d{13}$/)) errs.cnic_ntn = "Enter exactly 7 or 13 digits";
        if (!form.business_name || form.business_name.length > 100) errs.business_name = "Required, max 100 chars";
        if (!form.province_code) errs.province_code = "Province is required";
        if (!form.address || form.address.length > 250) errs.address = "Required, max 250 chars";
        if (!/^\+92\d{10}$/.test(form.mobile_number)) errs.mobile_number = "Format: +92XXXXXXXXXX";
        if (businessActivitySelection.business_activity_ids.length === 0) errs.business_activities = "At least one business activity is required";
        if (businessActivitySelection.business_activity_ids.length > 0 && businessActivitySelection.sector_ids.length === 0) {
            errs.sectors = "At least one sector is required when business activities are selected";
        }
        if (businessActivitySelection.combinations.length === 0 && businessActivitySelection.business_activity_ids.length > 0 && businessActivitySelection.sector_ids.length > 0) {
            errs.combinations = "No valid combinations found for selected business activities and sectors";
        }
        return errs;
    }, [form, businessActivitySelection]);

    const handleBusinessActivityChange = (activityId: number, checked: boolean) => {
        const newActivityIds = checked
            ? [...businessActivitySelection.business_activity_ids, activityId]
            : businessActivitySelection.business_activity_ids.filter(id => id !== activityId);

        // Clear sectors when business activities change
        const updatedSelection: UserBusinessActivitySelection = {
            ...businessActivitySelection,
            business_activity_ids: newActivityIds,
            sector_ids: [],
            combinations: []
        };

        onFieldChange("fbr_business_activity_selection", updatedSelection);
    };

    const handleSectorChange = (sectorId: number, checked: boolean) => {
        const newSectorIds = checked
            ? [...businessActivitySelection.sector_ids, sectorId]
            : businessActivitySelection.sector_ids.filter(id => id !== sectorId);

        // Generate combinations based on selected business activities and sectors
        const combinations: BusinessActivitySectorCombination[] = [];
        for (const activityId of businessActivitySelection.business_activity_ids) {
            for (const sectorId of newSectorIds) {
                const activity = businessActivityTypes.find(a => a.id === activityId);
                const sector = allSectors.find(s => s.id === sectorId);
                if (activity && sector) {
                    combinations.push({
                        id: 0, // Will be set by the backend
                        sr: 0, // Will be set by the backend
                        business_activity: activity.name,
                        sector: sector.name,
                        business_activity_description: activity.description || '',
                        sector_description: sector.description || ''
                    });
                }
            }
        }

        const updatedSelection: UserBusinessActivitySelection = {
            ...businessActivitySelection,
            sector_ids: newSectorIds,
            combinations
        };

        onFieldChange("fbr_business_activity_selection", updatedSelection);
    };

    if (loading) return (
        <Card className="shadow-lg border-0">
            <CardHeader>
                <CardTitle>FBR Profile Setup</CardTitle>
            </CardHeader>
            <CardContent>
                <div>Loading...</div>
            </CardContent>
        </Card>
    );

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
                            onChange={e => onFieldChange("fbr_cnic_ntn", e.target.value.replace(/\D/g, ""))}
                            maxLength={13}
                            className={errors.cnic_ntn ? "border-red-500" : undefined}
                        />
                        {errors.cnic_ntn && <p className="text-red-600 text-xs mt-1">{errors.cnic_ntn}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Business Name</label>
                        <Input
                            value={form.business_name}
                            onChange={e => onFieldChange("fbr_business_name", e.target.value)}
                            maxLength={100}
                            className={errors.business_name ? "border-red-500" : undefined}
                        />
                        {errors.business_name && <p className="text-red-600 text-xs mt-1">{errors.business_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Province</label>
                        <Select value={form.province_code} onValueChange={v => onFieldChange("fbr_province_code", v)}>
                            <SelectTrigger className={errors.province_code ? "border-red-500" : undefined}>
                                <SelectValue placeholder="Select a province" />
                            </SelectTrigger>
                            <SelectContent>
                                {provinces.map(p => (
                                    <SelectItem key={p.state_province_code} value={String(p.state_province_code)}>{p.state_province_desc}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.province_code && <p className="text-red-600 text-xs mt-1">{errors.province_code}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <Textarea
                            value={form.address}
                            onChange={e => onFieldChange("fbr_address", e.target.value)}
                            maxLength={250}
                            className={errors.address ? "border-red-500" : undefined}
                        />
                        {errors.address && <p className="text-red-600 text-xs mt-1">{errors.address}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mobile Number</label>
                        <Input
                            value={form.mobile_number}
                            onChange={e => onFieldChange("fbr_mobile_number", e.target.value)}
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
                                ({businessActivitySelection.business_activity_ids.length} selected)
                            </span>
                        </label>
                        <div className="space-y-2 p-4 border rounded-lg bg-gray-50">
                            {businessActivityTypes.map(activity => (
                                <div key={activity.id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors">
                                    <Checkbox
                                        id={`activity-${activity.id}`}
                                        checked={businessActivitySelection.business_activity_ids.includes(activity.id)}
                                        onCheckedChange={(checked) => handleBusinessActivityChange(activity.id, checked as boolean)}
                                    />
                                    <label htmlFor={`activity-${activity.id}`} className="text-sm font-medium cursor-pointer flex-1">
                                        {activity.name}
                                    </label>
                                    {activity.description && (
                                        <span className="text-xs text-gray-500">- {activity.description}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.business_activities && <p className="text-red-600 text-xs mt-1">{errors.business_activities}</p>}
                    </div>

                    {/* Sectors Selection */}
                    {businessActivitySelection.business_activity_ids.length > 0 && (
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
                                        <div key={`${sector.sector_id}-${sector.business_activity}-${index}`} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors">
                                            <Checkbox
                                                id={`sector-${sector.sector_id}-${sector.business_activity}-${index}`}
                                                checked={businessActivitySelection.sector_ids.includes(sector.sector_id)}
                                                onCheckedChange={(checked) => handleSectorChange(sector.sector_id, checked as boolean)}
                                            />
                                            <label htmlFor={`sector-${sector.sector_id}-${sector.business_activity}-${index}`} className="text-sm font-medium cursor-pointer flex-1">
                                                {sector.sector_name}
                                            </label>
                                            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                                                {sector.business_activity}
                                            </span>
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
                    {businessActivitySelection.combinations.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Selected Combinations
                                <span className="text-xs text-gray-500 ml-2">
                                    ({businessActivitySelection.combinations.length} combinations)
                                </span>
                            </label>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {businessActivitySelection.combinations.map((combination, index) => (
                                    <div key={`${combination.business_activity}-${combination.sector}-${index}`} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                {combination.business_activity}
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
                                {applicableScenarios.map(scenario => (
                                    <div key={`${scenario.scenario_id}-${scenario.business_activity}-${scenario.sector}`} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 shadow-sm">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800 font-mono">
                                                {scenario.scenario_code}
                                            </Badge>
                                            <span className="text-sm text-gray-600">
                                                {scenario.business_activity} × {scenario.sector}
                                            </span>
                                        </div>
                                    </div>
                                ))}
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
