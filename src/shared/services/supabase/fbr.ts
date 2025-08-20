import { supabase } from "./client";

export type FbrProfilePayload = {
	user_id: string;
	cnic_ntn: string;
	business_name: string;
	province_code: number;
	address: string;
	mobile_number: string;
	business_activity_id: number;
};

export async function getProvinceCodes() {
	return await supabase
		.from("province_codes")
		.select("state_province_code, state_province_desc")
		.order("state_province_desc");
}

export async function getBusinessActivities() {
	// Return full rows; UI can derive distinct activity names and sectors
	return await supabase
		.from("business_activity")
		.select("id, sr, business_activity, sector")
		.order("business_activity")
		.order("sector");
}

export async function getFbrProfileByUser(userId: string) {
	return await supabase
		.from("fbr_profiles")
		.select("user_id, cnic_ntn, business_name, province_code, address, mobile_number, business_activity_id")
		.eq("user_id", userId)
		.maybeSingle();
}

export async function upsertFbrProfile(payload: FbrProfilePayload) {
	return await supabase
		.from("fbr_profiles")
		.upsert(payload, { onConflict: "user_id" })
		.select()
		.single();
} 