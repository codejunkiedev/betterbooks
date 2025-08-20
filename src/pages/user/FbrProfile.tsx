import { useEffect, useMemo, useState } from "react";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/Select";
import { useToast } from "@/shared/hooks/useToast";
import { getProvinceCodes, getBusinessActivities } from "@/shared/services/supabase/fbr";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/Card";

interface Province {
	state_province_code: number;
	state_province_desc: string;
}

interface BusinessActivityRow {
	id: number;
	sr: number;
	business_activity: string;
	sector: string;
}

interface FbrProfileProps {
	cnicNtn: string;
	businessName: string;
	provinceCode: string;
	address: string;
	mobileNumber: string;
	activityName: string;
	sector: string;
	onFieldChange: (field: string, value: string) => void;
}

export default function FbrProfile({
	cnicNtn,
	businessName,
	provinceCode,
	address,
	mobileNumber,
	activityName,
	sector,
	onFieldChange
}: FbrProfileProps) {
	const { toast } = useToast();
	const [loading, setLoading] = useState(true);

	const [provinces, setProvinces] = useState<Province[]>([]);
	const [activityRows, setActivityRows] = useState<BusinessActivityRow[]>([]);

	const form = {
		cnic_ntn: cnicNtn,
		business_name: businessName,
		province_code: provinceCode,
		address: address,
		mobile_number: mobileNumber,
		activity_name: activityName,
		sector: sector,
	};

	const activityNames = useMemo(
		() => Array.from(new Set(activityRows.map(a => a.business_activity))),
		[activityRows]
	);

	const sectorsForSelected = useMemo(
		() => activityRows.filter(a => a.business_activity === form.activity_name).map(a => a.sector),
		[activityRows, form.activity_name]
	);

	const selectedActivityId = useMemo(() => {
		const match = activityRows.find(a => a.business_activity === form.activity_name && a.sector === form.sector);
		return match?.id ?? null;
	}, [activityRows, form.activity_name, form.sector]);

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
		if (!form.cnic_ntn.match(/^\d{7}$|^\d{13}$/)) errs.cnic_ntn = "Enter exactly 7 or 13 digits";
		if (!form.business_name || form.business_name.length > 100) errs.business_name = "Required, max 100 chars";
		if (!form.province_code) errs.province_code = "Province is required";
		if (!form.address || form.address.length > 250) errs.address = "Required, max 250 chars";
		if (!/^\+92\d{10}$/.test(form.mobile_number)) errs.mobile_number = "Format: +92XXXXXXXXXX";
		if (!form.activity_name) errs.activity_name = "Business activity is required";
		if (!form.sector) errs.sector = "Business sector is required";
		if (!selectedActivityId) errs.business_activity_id = "Select a valid activity and sector";
		return errs;
	}, [form, selectedActivityId]);



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
						<label className="block text-sm font-medium mb-1">Business Activity</label>
						<Select
							value={form.activity_name}
							onValueChange={v => {
								onFieldChange("fbr_activity_name", v);
								onFieldChange("fbr_sector", "");
							}}
						>
							<SelectTrigger className={errors.activity_name ? "border-red-500" : undefined}>
								<SelectValue placeholder="Select activity" />
							</SelectTrigger>
							<SelectContent>
								{activityNames.map(name => (
									<SelectItem key={name} value={name}>{name}</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.activity_name && <p className="text-red-600 text-xs mt-1">{errors.activity_name}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Business Sector</label>
						<Select
							value={form.sector}
							onValueChange={v => onFieldChange("fbr_sector", v)}
							disabled={!form.activity_name}
						>
							<SelectTrigger className={errors.sector ? "border-red-500" : undefined}>
								<SelectValue placeholder="Select sector" />
							</SelectTrigger>
							<SelectContent>
								{sectorsForSelected.map(sec => (
									<SelectItem key={sec} value={sec}>{sec}</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.sector && <p className="text-red-600 text-xs mt-1">{errors.sector}</p>}
					</div>
				</div>
			</CardContent>
		</Card>
	);
} 