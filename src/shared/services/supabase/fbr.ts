import { encryptGcm, decryptGcm } from '@/shared/utils/encryption';
import { supabase } from './client';
import { FBR_API_STATUS, FbrApiStatus } from '@/shared/constants/fbr';
import type { FbrScenarioProgress, FbrScenarioSummary } from '@/shared/types/fbr';

export interface FbrConfigStatus {
	sandbox_status: FbrApiStatus;
	production_status: FbrApiStatus;
	last_sandbox_test?: string | null;
	last_production_test?: string | null;
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
		// First check if the record exists
		const { data: existingRecord, error: checkError } = await supabase
			.from('fbr_api_configs')
			.select('id')
			.eq('user_id', userId)
			.maybeSingle();

		if (checkError) {
			console.error('Failed to check existing fbr_api_configs:', checkError);
			throw checkError;
		}

		let data: { sandbox_status?: string; production_status?: string; last_sandbox_test?: string; last_production_test?: string };

		if (!existingRecord) {
			// Record doesn't exist, create it first
			const insertPayload = {
				user_id: userId,
				...updatePayload
			};

			const { data: insertedData, error: insertError } = await supabase
				.from('fbr_api_configs')
				.insert(insertPayload)
				.select('sandbox_status, production_status, last_sandbox_test, last_production_test')
				.single();

			if (insertError) {
				console.error('Failed to insert fbr_api_configs:', insertError);
				throw insertError;
			}

			data = insertedData;
		} else {
			// Record exists, update it
			const { data: updatedData, error: updateError } = await supabase
				.from('fbr_api_configs')
				.update(updatePayload)
				.eq('user_id', userId)
				.select('sandbox_status, production_status, last_sandbox_test, last_production_test')
				.single();

			if (updateError) {
				console.error('Failed to update fbr_api_configs:', updateError);
				throw updateError;
			}

			data = updatedData;
		}

		return {
			sandbox_status: (data.sandbox_status as FbrApiStatus) || FBR_API_STATUS.NOT_CONFIGURED,
			production_status: (data.production_status as FbrApiStatus) || FBR_API_STATUS.NOT_CONFIGURED,
			last_sandbox_test: data.last_sandbox_test || null,
			last_production_test: data.last_production_test || null
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

/**
 * Get mandatory scenarios for user's business activity
 */
export async function getUserScenarios(userId: string): Promise<string[]> {
	try {
		// Get user's business activity
		const { data: profile, error: profileError } = await supabase
			.from('fbr_profiles')
			.select('business_activity_id')
			.eq('user_id', userId)
			.maybeSingle();

		if (profileError) {
			console.error('Failed to get user FBR profile:', profileError);
			throw profileError;
		}

		if (!profile) {
			// User doesn't have an FBR profile yet
			return [];
		}

		// Get scenarios for the business activity
		const { data: scenarios, error: scenariosError } = await supabase
			.from('business_activity_scenario')
			.select(`
				scenario_id,
				scenario:scenario_id(code)
			`)
			.eq('business_activity_id', profile.business_activity_id);

		if (scenariosError) {
			console.error('Failed to get scenarios for business activity:', scenariosError);
			throw scenariosError;
		}

		// Extract scenario codes from the response
		const scenarioCodes = scenarios?.map((s: { scenario?: { code?: string }[] }) => {
			if (s.scenario && Array.isArray(s.scenario) && s.scenario.length > 0) {
				return s.scenario[0].code;
			}
			return null;
		}).filter((code): code is string => Boolean(code)) || [];

		return scenarioCodes;
	} catch (err) {
		console.error('Failed to get user scenarios:', err);
		throw err;
	}
}

/**
 * Get scenario progress for user
 */
export async function getScenarioProgress(userId: string): Promise<FbrScenarioProgress[]> {
	try {
		const { data, error } = await supabase
			.from('fbr_scenario_progress')
			.select('*')
			.eq('user_id', userId)
			.order('scenario_id');

		if (error) {
			console.error('Failed to get scenario progress:', error);
			throw error;
		}

		return data || [];
	} catch (err) {
		console.error('Failed to get scenario progress:', err);
		throw err;
	}
}

/**
 * Initialize scenario progress for user
 */
export async function initializeScenarioProgress(userId: string, scenarioIds: string[]): Promise<void> {
	try {
		// Get existing progress
		const { data: existingProgress } = await supabase
			.from('fbr_scenario_progress')
			.select('scenario_id')
			.eq('user_id', userId);

		const existingScenarioIds = existingProgress?.map(p => p.scenario_id) || [];

		// Find scenarios that need to be initialized
		const scenariosToInitialize = scenarioIds.filter(id => !existingScenarioIds.includes(id));

		if (scenariosToInitialize.length === 0) {
			return;
		}

		// Insert new scenario progress records
		const progressRecords = scenariosToInitialize.map(scenarioId => ({
			user_id: userId,
			scenario_id: scenarioId,
			status: 'not_started',
			attempts: 0
		}));

		const { error } = await supabase
			.from('fbr_scenario_progress')
			.insert(progressRecords);

		if (error) {
			console.error('Failed to initialize scenario progress:', error);
			throw error;
		}
	} catch (err) {
		console.error('Failed to initialize scenario progress:', err);
		throw err;
	}
}

/**
 * Update scenario progress
 */
export async function updateScenarioProgress(
	userId: string,
	scenarioId: string,
	status: 'not_started' | 'in_progress' | 'completed' | 'failed',
	fbrResponse?: string
): Promise<FbrScenarioProgress> {
	try {
		const now = new Date().toISOString();
		const updatePayload: {
			status: 'not_started' | 'in_progress' | 'completed' | 'failed';
			updated_at: string;
			last_attempt?: string;
			attempts?: number;
			fbr_response?: string;
		} = {
			status,
			updated_at: now
		};

		if (status === 'in_progress' || status === 'completed' || status === 'failed') {
			updatePayload.last_attempt = now;
			// We'll handle the increment in the database query
		}

		if (fbrResponse) {
			updatePayload.fbr_response = fbrResponse;
		}

		// First check if the record exists
		const { data: existingRecord, error: checkError } = await supabase
			.from('fbr_scenario_progress')
			.select('id')
			.eq('user_id', userId)
			.eq('scenario_id', scenarioId)
			.maybeSingle();

		if (checkError) {
			console.error('Failed to check existing scenario progress:', checkError);
			throw checkError;
		}

		let data: FbrScenarioProgress;

		if (!existingRecord) {
			// Record doesn't exist, create it first
			const insertPayload = {
				user_id: userId,
				scenario_id: scenarioId,
				...updatePayload,
				attempts: status === 'in_progress' || status === 'completed' || status === 'failed' ? 1 : 0
			};

			const { data: insertedData, error: insertError } = await supabase
				.from('fbr_scenario_progress')
				.insert(insertPayload)
				.select()
				.single();

			if (insertError) {
				console.error('Failed to insert scenario progress:', insertError);
				throw insertError;
			}

			data = insertedData;
		} else {
			// Record exists, update it
			const { data: updatedData, error: updateError } = await supabase
				.from('fbr_scenario_progress')
				.update(updatePayload)
				.eq('user_id', userId)
				.eq('scenario_id', scenarioId)
				.select()
				.single();

			if (updateError) {
				console.error('Failed to update scenario progress:', updateError);
				throw updateError;
			}

			data = updatedData;
		}

		return data;
	} catch (err) {
		console.error('Failed to update scenario progress:', err);
		throw err;
	}
}

/**
 * Get scenario summary for user
 */
export async function getScenarioSummary(userId: string): Promise<FbrScenarioSummary> {
	try {
		const { data, error } = await supabase
			.from('fbr_scenario_progress')
			.select('status')
			.eq('user_id', userId);

		if (error) {
			console.error('Failed to get scenario summary:', error);
			throw error;
		}

		const totalScenarios = data?.length || 0;
		const completedScenarios = data?.filter(s => s.status === 'completed').length || 0;
		const inProgressScenarios = data?.filter(s => s.status === 'in_progress').length || 0;
		const failedScenarios = data?.filter(s => s.status === 'failed').length || 0;
		const notStartedScenarios = data?.filter(s => s.status === 'not_started').length || 0;

		const completionPercentage = totalScenarios > 0 ? Math.round((completedScenarios / totalScenarios) * 100) : 0;
		const isComplete = completedScenarios === totalScenarios && totalScenarios > 0;

		return {
			totalScenarios,
			completedScenarios,
			inProgressScenarios,
			failedScenarios,
			notStartedScenarios,
			completionPercentage,
			isComplete
		};
	} catch (err) {
		console.error('Failed to get scenario summary:', err);
		throw err;
	}
} 