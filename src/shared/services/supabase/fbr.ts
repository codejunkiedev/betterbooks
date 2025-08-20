import { encryptGcm, decryptGcm } from '@/shared/utils/encryption';
import { supabase } from './client';
import { FBR_API_STATUS } from '@/shared/constants/fbr';

export interface FbrConfigStatus {
	sandbox_status: string;
	production_status: string;
	last_sandbox_test?: string;
	last_production_test?: string;
	sandbox_api_key?: string | null;
	production_api_key?: string | null;
}

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

/**
 * Update FBR connection status in database
 */
export async function updateFbrConnectionStatus(userId: string, environment: 'sandbox' | 'production', status: 'connected' | 'failed'): Promise<FbrConfigStatus> {
	const now = new Date().toISOString();
	const updatePayload: { updated_at: string; sandbox_status?: string; production_status?: string; last_sandbox_test?: string; last_production_test?: string } = { updated_at: now };

	if (environment === 'sandbox') {
		updatePayload.sandbox_status = status;
		updatePayload.last_sandbox_test = now;
	} else {
		updatePayload.production_status = status;
		updatePayload.last_production_test = now;
	}

	try {
		const { data, error } = await supabase
			.from('fbr_api_configs')
			.update(updatePayload)
			.eq('user_id', userId)
			.select('sandbox_status, production_status, last_sandbox_test, last_production_test')
			.single();

		if (error) {
			console.error('Failed to update fbr_api_configs:', error);
			throw error;
		}

		return {
			sandbox_status: data.sandbox_status || FBR_API_STATUS.NOT_CONFIGURED,
			production_status: data.production_status || FBR_API_STATUS.NOT_CONFIGURED,
			last_sandbox_test: data.last_sandbox_test,
			last_production_test: data.last_production_test
		};
	} catch (err) {
		console.error('Failed to update fbr_api_configs:', err);
		throw err;
	}
}

/**
 * Save FBR API credentials securely
 */
export async function saveFbrCredentials(userId: string, sandboxKey?: string, productionKey?: string): Promise<void> {
	if (!sandboxKey && !productionKey) {
		throw new Error('Please provide at least one API key');
	}

	const updatePayload: { updated_at: string; sandbox_api_key?: string; production_api_key?: string } = {
		updated_at: new Date().toISOString()
	};

	if (sandboxKey) {
		updatePayload.sandbox_api_key = await encryptGcm(sandboxKey);
	}
	if (productionKey) {
		updatePayload.production_api_key = await encryptGcm(productionKey);
	}

	// Try update first
	const { data: updated, error: updateError } = await supabase
		.from('fbr_api_configs')
		.update(updatePayload)
		.eq('user_id', userId)
		.select('id');

	if (updateError) {
		throw new Error('Failed to save credentials');
	}

	if (Array.isArray(updated) && updated.length > 0) {
		return; // Successfully updated
	}

	// If no row updated, insert new
	const insertPayload: { user_id: string; sandbox_api_key?: string; production_api_key?: string } = {
		user_id: userId
	};
	if (updatePayload.sandbox_api_key) insertPayload.sandbox_api_key = updatePayload.sandbox_api_key;
	if (updatePayload.production_api_key) insertPayload.production_api_key = updatePayload.production_api_key;

	const { error: insertError } = await supabase
		.from('fbr_api_configs')
		.insert(insertPayload);

	if (insertError) {
		throw new Error('Failed to save credentials');
	}
}

/**
 * Get FBR API configuration status
 */
export async function getFbrConfigStatus(userId: string): Promise<FbrConfigStatus> {
	const { data, error } = await supabase
		.from('fbr_api_configs')
		.select('sandbox_status, production_status, last_sandbox_test, last_production_test, sandbox_api_key, production_api_key')
		.eq('user_id', userId)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			// No record found - return default status
			return {
				sandbox_status: 'not_configured',
				production_status: 'not_configured'
			};
		}

		console.error('Database error:', error);
		throw new Error('Failed to retrieve configuration status');
	}

	// Decrypt API keys if they exist
	let decryptedSandboxKey = null;
	let decryptedProductionKey = null;

	if (data.sandbox_api_key) {
		try {
			decryptedSandboxKey = await decryptGcm(data.sandbox_api_key);
		} catch (error) {
			console.error('Failed to decrypt sandbox API key:', error);
		}
	}

	if (data.production_api_key) {
		try {
			decryptedProductionKey = await decryptGcm(data.production_api_key);
		} catch (error) {
			console.error('Failed to decrypt production API key:', error);
		}
	}

	return {
		sandbox_status: data.sandbox_status || 'not_configured',
		production_status: data.production_status || 'not_configured',
		last_sandbox_test: data.last_sandbox_test,
		last_production_test: data.last_production_test,
		sandbox_api_key: decryptedSandboxKey,
		production_api_key: decryptedProductionKey
	};
} 