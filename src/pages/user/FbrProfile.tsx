import { useEffect, useMemo, useState } from "react";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { Button } from "@/shared/components/Button";
import { Badge } from "@/shared/components/Badge";
import { useToast } from "@/shared/hooks/useToast";
import { getProvinceCodes, getBusinessActivities } from "@/shared/services/supabase/fbr";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";
import { BusinessActivity, UserBusinessActivity } from "@/shared/types/fbr";

interface Province {
	state_province_code: number;
	state_province_desc: string;
}

interface FbrProfileProps {
	cnicNtn: string;
	businessName: string;
	provinceCode: string;
	address: string;
	mobileNumber: string;
	selectedActivities: UserBusinessActivity[];
	onFieldChange: (field: string, value: string | UserBusinessActivity[]) => void;
}

export default function FbrProfile({
	cnicNtn,
	businessName,
	provinceCode,
	address,
	mobileNumber,
	selectedActivities,
	onFieldChange
}: FbrProfileProps) {
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);
	const [showAddActivity, setShowAddActivity] = useState(false);
	const [newActivityName, setNewActivityName] = useState("");
	const [newSector, setNewSector] = useState("");

	const [provinces, setProvinces] = useState<Province[]>([]);
	const [activityRows, setActivityRows] = useState<BusinessActivity[]>([]);

	const form = useMemo(() => ({
		cnic_ntn: cnicNtn,
		business_name: businessName,
		province_code: provinceCode,
		address: address,
		mobile_number: mobileNumber,
	}), [cnicNtn, businessName, provinceCode, address, mobileNumber]);

	const activityNames = useMemo(
		() => Array.from(new Set(activityRows.map(a => a.business_activity))),
		[activityRows]
	);

	const sectorsForSelected = useMemo(
		() => activityRows.filter(a => a.business_activity === newActivityName).map(a => a.sector),
		[activityRows, newActivityName]
	);

	const selectedActivityIds = useMemo(() => {
		return selectedActivities.map(a => a.business_activity_id);
	}, [selectedActivities]);

	const primaryActivity = useMemo(() => {
		return selectedActivities.find(a => a.is_primary);
	}, [selectedActivities]);

	useEffect(() => {
		const run = async () => {
			try {
				const [{ data: provData, error: provErr }, { data: actData, error: actErr }] = await Promise.all([
					getProvinceCodes(),
					getBusinessActivities(),
				]);
				if (provErr) throw provErr;
				if (actErr) throw actErr;
				setProvinces(provData || []);
				setActivityRows(actData || []);
			} catch (e) {
				console.error(e);
				toast({ title: "Error", description: "Failed to load FBR profile data.", variant: "destructive" });
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [toast]);

	const errors = useMemo(() => {
		const errs: Record<string, string> = {};
		if (!form.cnic_ntn || !form.cnic_ntn.match(/^\d{7}$|^\d{13}$/)) errs.cnic_ntn = "Enter exactly 7 or 13 digits";
		if (!form.business_name || form.business_name.length > 100) errs.business_name = "Required, max 100 chars";
		if (!form.province_code) errs.province_code = "Province is required";
		if (!form.address || form.address.length > 250) errs.address = "Required, max 250 chars";
		if (!/^\+92\d{10}$/.test(form.mobile_number)) errs.mobile_number = "Format: +92XXXXXXXXXX";
		if (selectedActivities.length === 0) errs.business_activities = "At least one business activity is required";
		if (selectedActivities.length > 0 && !primaryActivity) errs.primary_activity = "One activity must be set as primary";
		return errs;
	}, [form, selectedActivities, primaryActivity]);

	const handleAddActivity = () => {
		const selectedActivity = activityRows.find(
			a => a.business_activity === newActivityName && a.sector === newSector
		);

		if (!selectedActivity) {
			toast({ title: "Error", description: "Please select a valid activity and sector", variant: "destructive" });
			return;
		}

		if (selectedActivityIds.includes(selectedActivity.id)) {
			toast({ title: "Error", description: "This business activity is already selected", variant: "destructive" });
			return;
		}

		const newUserActivity: UserBusinessActivity = {
			id: `temp-${Date.now()}`,
			user_id: "",
			business_activity_id: selectedActivity.id,
			is_primary: selectedActivities.length === 0, // First activity is primary
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			sr: selectedActivity.sr,
			business_activity: selectedActivity.business_activity,
			sector: selectedActivity.sector
		};

		const updatedActivities = [...selectedActivities, newUserActivity];
		onFieldChange("fbr_business_activities", updatedActivities);

		setNewActivityName("");
		setNewSector("");
		setShowAddActivity(false);
	};

	const handleRemoveActivity = (activityId: number) => {
		const updatedActivities = selectedActivities.filter(a => a.business_activity_id !== activityId);

		// If we removed the primary activity, make the first remaining one primary
		if (updatedActivities.length > 0 && !updatedActivities.some(a => a.is_primary)) {
			updatedActivities[0].is_primary = true;
		}

		onFieldChange("fbr_business_activities", updatedActivities);
	};

	const handleSetPrimary = (activityId: number) => {
		const updatedActivities = selectedActivities.map(a => ({
			...a,
			is_primary: a.business_activity_id === activityId
		}));

		onFieldChange("fbr_business_activities", updatedActivities);
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
					<div>
						<label className="block text-sm font-medium mb-1">Business Activities</label>

						{/* Selected Activities */}
						{selectedActivities.length > 0 && (
							<div className="space-y-2 mb-4">
								{selectedActivities.map((activity) => (
									<div key={activity.business_activity_id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
										<div className="flex items-center space-x-2">
											<span className="font-medium">{activity.business_activity}</span>
											<span className="text-gray-500">-</span>
											<span className="text-gray-600">{activity.sector}</span>
											{activity.is_primary && (
												<Badge variant="default" className="text-xs">Primary</Badge>
											)}
										</div>
										<div className="flex items-center space-x-2">
											{!activity.is_primary && (
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleSetPrimary(activity.business_activity_id)}
												>
													Set Primary
												</Button>
											)}
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleRemoveActivity(activity.business_activity_id)}
											>
												Remove
											</Button>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Add New Activity */}
						{!showAddActivity ? (
							<Button
								variant="outline"
								onClick={() => setShowAddActivity(true)}
								className="w-full"
							>
								+ Add Business Activity
							</Button>
						) : (
							<div className="space-y-3 p-4 border rounded-lg bg-gray-50">
								<div>
									<label className="block text-sm font-medium mb-1">Business Activity</label>
									<Select
										value={newActivityName}
										onValueChange={v => {
											setNewActivityName(v);
											setNewSector("");
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select activity" />
										</SelectTrigger>
										<SelectContent>
											{activityNames.map(name => (
												<SelectItem key={name} value={name}>{name}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">Business Sector</label>
									<Select
										value={newSector}
										onValueChange={setNewSector}
										disabled={!newActivityName}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select sector" />
										</SelectTrigger>
										<SelectContent>
											{sectorsForSelected.map(sec => (
												<SelectItem key={sec} value={sec}>{sec}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div className="flex space-x-2">
									<Button
										onClick={handleAddActivity}
										disabled={!newActivityName || !newSector}
										className="flex-1"
									>
										Add Activity
									</Button>
									<Button
										variant="outline"
										onClick={() => {
											setShowAddActivity(false);
											setNewActivityName("");
											setNewSector("");
										}}
										className="flex-1"
									>
										Cancel
									</Button>
								</div>
							</div>
						)}

						{errors.business_activities && <p className="text-red-600 text-xs mt-1">{errors.business_activities}</p>}
						{errors.primary_activity && <p className="text-red-600 text-xs mt-1">{errors.primary_activity}</p>}
					</div>
				</div>
			</CardContent>
		</Card>
	);
} 