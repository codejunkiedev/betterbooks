import { encryptGcm, decryptGcm } from '@/shared/utils/encryption';
import { supabase } from './client';
import { FBR_API_STATUS } from '@/shared/constants/fbr';
import type { FbrScenarioProgress } from '@/shared/types/fbr';

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
	ntn_number?: string;
	strn_number?: string;
};

/**
 * Get FBR profile by user ID
 */
export async function getFbrProfileByUser(userId: string) {
	const { data, error } = await supabase
		.from("fbr_profiles")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) throw error;
	return data;
}

/**
 * Upsert FBR profile
 */
export async function upsertFbrProfile(payload: FbrProfilePayload) {
	const { data, error } = await supabase
		.from("fbr_profiles")
		.upsert(payload, { onConflict: "user_id" })
		.select()
		.single();

	if (error) throw error;
	return data;
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
	const updatePayload: { updated_at: string; sandbox_api_key?: string; production_api_key?: string } = { updated_at: new Date().toISOString() };

	if (sandboxKey) {
		updatePayload.sandbox_api_key = await encryptGcm(sandboxKey);
	}

	if (productionKey) {
		updatePayload.production_api_key = await encryptGcm(productionKey);
	}

	const { error } = await supabase
		.from('fbr_api_configs')
		.upsert({
			user_id: userId,
			...updatePayload
		}, { onConflict: 'user_id' });

	if (error) {
		console.error('Failed to save FBR credentials:', error);
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
 * Get all province codes
 */
export async function getProvinceCodes() {
	const { data, error } = await supabase
		.from("province_codes")
		.select("*")
		.order("state_province_code");

	return { data, error };
}

/**
 * Get all business activities
 */
export async function getBusinessActivities() {
	const { data, error } = await supabase
		.from("business_activity")
		.select("*")
		.order("sr");

	return { data, error };
}

/**
 * Get user's business activity ID from FBR profile
 */
export async function getUserBusinessActivityId(userId: string): Promise<number | null> {
	const { data, error } = await supabase
		.from('fbr_profiles')
		.select('business_activity_id')
		.eq('user_id', userId)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			return null; // No profile found
		}
		throw error;
	}

	return data.business_activity_id;
}

/**
 * Get mandatory scenarios for a business activity with full scenario details
 */
export async function getMandatoryScenarios(businessActivityId: number): Promise<Array<{
	scenario_id: string;
	scenario: {
		code: string;
		description: string;
		sale_type: string;
		category: string;
	};
}>> {
	const { data, error } = await supabase
		.from('business_activity_scenario')
		.select(`
			scenario_id,
			scenario!scenario_id (
				code,
				description,
				sale_type,
				category
			)
		`)
		.eq('business_activity_id', businessActivityId);

	if (error) {
		console.error('Failed to get mandatory scenarios:', error);
		throw error;
	}

	// Transform the data to fix the type issue
	return (data || []).map(item => ({
		scenario_id: item.scenario_id,
		scenario: Array.isArray(item.scenario) ? item.scenario[0] : item.scenario
	}));
}

/**
 * Get scenario details by ID
 */
export async function getScenarioDetails(scenarioId: string) {
	const { data, error } = await supabase
		.from('scenario')
		.select('code, description, sale_type, category')
		.eq('code', scenarioId)
		.single();

	if (error) {
		console.error('Failed to get scenario details:', error);
		throw error;
	}

	return data;
}

/**
 * Get user's scenario progress
 */
export async function getUserScenarioProgress(userId: string): Promise<FbrScenarioProgress[]> {
	const { data, error } = await supabase
		.from('fbr_scenario_progress')
		.select('*')
		.eq('user_id', userId);

	if (error) {
		console.error('Failed to get scenario progress:', error);
		throw error;
	}

	return data || [];
}

/**
 * Initialize scenario progress for user
 */
export async function initializeScenarioProgress(userId: string, scenarioIds: string[]): Promise<void> {
	if (!scenarioIds.length) {
		return; // No scenarios to initialize
	}

	try {
		// Get existing progress to avoid unnecessary inserts
		const existingProgress = await getUserScenarioProgress(userId);
		const existingScenarioIds = new Set(existingProgress.map(p => p.scenario_id));

		// Find scenarios that need initialization
		const newScenarioIds = scenarioIds.filter(id => !existingScenarioIds.has(id));

		if (newScenarioIds.length === 0) {
			return; // All scenarios already initialized
		}

		// Create progress records only for new scenarios
		const progressRecords = newScenarioIds.map(scenarioId => ({
			user_id: userId,
			scenario_id: scenarioId,
			status: 'not_started'
		}));

		// Insert new scenario progress records
		const { error } = await supabase
			.from('fbr_scenario_progress')
			.insert(progressRecords);

		if (error) {
			console.error('Failed to initialize scenario progress:', error);
			// Don't throw the error, just log it and continue
			// This prevents the entire scenario loading from failing
		}
	} catch (err) {
		console.error('Error in initializeScenarioProgress:', err);
		// Don't throw the error, just log it and continue
		// This prevents the entire scenario loading from failing
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
	const updatePayload: Partial<FbrScenarioProgress> = {
		status,
		last_attempt: new Date().toISOString(),
		updated_at: new Date().toISOString()
	};

	if (fbrResponse) {
		updatePayload.fbr_response = fbrResponse;
	}

	if (status === 'completed') {
		updatePayload.completion_timestamp = new Date().toISOString();
	}

	const { data, error } = await supabase
		.from('fbr_scenario_progress')
		.update(updatePayload)
		.eq('user_id', userId)
		.eq('scenario_id', scenarioId)
		.select()
		.single();

	if (error) {
		console.error('Failed to update scenario progress:', error);
		throw error;
	}

	return data;
}

/**
 * Get scenario progress summary
 */
export async function getScenarioProgressSummary(userId: string): Promise<{
	total: number;
	completed: number;
	inProgress: number;
	failed: number;
	notStarted: number;
	completionPercentage: number;
}> {
	const progress = await getUserScenarioProgress(userId);

	const total = progress.length;
	const completed = progress.filter(p => p.status === 'completed').length;
	const inProgress = progress.filter(p => p.status === 'in_progress').length;
	const failed = progress.filter(p => p.status === 'failed').length;
	const notStarted = progress.filter(p => p.status === 'not_started').length;
	const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

	return {
		total,
		completed,
		inProgress,
		failed,
		notStarted,
		completionPercentage
	};
}

/**
 * Check if all mandatory scenarios are completed for a user
 */
export async function areAllScenariosCompleted(userId: string): Promise<boolean> {
	const summary = await getScenarioProgressSummary(userId);
	return summary.completionPercentage === 100;
}

/**
 * Get scenarios that are ready to be started (dependencies met)
 */
export async function getReadyScenarios(userId: string): Promise<string[]> {
	// For now, all scenarios are independent
	// In the future, this could check for scenario dependencies
	const progress = await getUserScenarioProgress(userId);
	return progress
		.filter(p => p.status === 'not_started')
		.map(p => p.scenario_id);
} 