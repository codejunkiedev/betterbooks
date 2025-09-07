import { encryptGcm, decryptGcm } from '@/shared/utils/encryption';
import { supabase } from './client';
import { FBR_API_STATUS, FBR_SCENARIO_STATUS, FbrScenarioStatus } from '@/shared/constants/fbr';
import type {
	FbrScenarioProgress,
	FbrScenarioProgressResult,
	FbrScenario,
	FbrConfigStatus,
	FbrProfile,
	FbrProfilePayload,
	ScenarioFilters,
	ScenarioWithProgress
} from '@/shared/types/fbr';

/**
 * Get FBR profile by user ID
 */
export async function getFbrProfileByUser(userId: string): Promise<FbrProfile | null> {
	const { data, error } = await supabase
		.from("fbr_profiles")
		.select("*")
		.eq("user_id", userId)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			return null; // No profile found
		}
		throw error;
	}
	return data;
}

/**
 * Get FBR profile data formatted for seller information in invoices
 */
export async function getFbrProfileForSellerData(userId: string) {
	try {
		const { data, error } = await supabase
			.from("fbr_profiles")
			.select("cnic_ntn, business_name, address, province_code")
			.eq("user_id", userId)
			.single();

		if (error) {
			if (error.code === 'PGRST116') {
				return null; // No profile found
			}
			throw error;
		}

		// Get province description
		const { data: provinceData, error: provinceError } = await supabase
			.from("province_codes")
			.select("state_province_desc")
			.eq("state_province_code", data.province_code)
			.single();

		if (provinceError) {
			if (provinceError.code === 'PGRST116') {
				console.warn(`Province code ${data.province_code} not found in province_codes table`);
				// Continue without province description
			} else {
				console.error('Error fetching province data:', provinceError);
				throw provinceError;
			}
		}

		return {
			sellerNTNCNIC: data.cnic_ntn,
			sellerBusinessName: data.business_name,
			sellerProvince: provinceData?.state_province_desc || '',
			sellerAddress: data.address
		};
	} catch (error) {
		console.error('Error fetching FBR profile for seller data:', error);
		throw error;
	}
}

/**
 * Upsert FBR profile
 */
export async function upsertFbrProfile(payload: FbrProfilePayload) {
	// First check if the CNIC/NTN already exists for a different user
	const { data: existingCnicNtn, error: checkError } = await supabase
		.from("fbr_profiles")
		.select("user_id")
		.eq("cnic_ntn", payload.cnic_ntn)
		.neq("user_id", payload.user_id)
		.maybeSingle();

	if (checkError) {
		throw new Error(`Error checking existing CNIC/NTN: ${checkError.message}`);
	}

	if (existingCnicNtn) {
		throw new Error(`CNIC/NTN ${payload.cnic_ntn} is already registered by another user. Please use a different CNIC/NTN or contact support if this is an error.`);
	}

	// Now proceed with upsert
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
	try {
		const now = new Date().toISOString();
		const updatePayload: { updated_at: string; sandbox_status?: string; production_status?: string; last_sandbox_test?: string; last_production_test?: string } = { updated_at: now };

		if (environment === 'sandbox') {
			updatePayload.sandbox_status = status;
			updatePayload.last_sandbox_test = now;
		} else {
			updatePayload.production_status = status;
			updatePayload.last_production_test = now;
		}

		// First check if a record exists
		const { data: existingRecord, error: checkError } = await supabase
			.from('fbr_api_configs')
			.select('id')
			.eq('user_id', userId)
			.single();

		if (checkError && checkError.code !== 'PGRST116') {
			console.error('Error checking existing record:', checkError);
			throw new Error(`Failed to check existing record: ${checkError.message}`);
		}

		if (existingRecord) {
			// Update existing record
			const { data, error } = await supabase
				.from('fbr_api_configs')
				.update(updatePayload)
				.eq('user_id', userId)
				.select('sandbox_status, production_status, last_sandbox_test, last_production_test')
				.single();

			if (error) {
				throw error;
			}

			return {
				sandbox_status: data.sandbox_status || FBR_API_STATUS.NOT_CONFIGURED,
				production_status: data.production_status || FBR_API_STATUS.NOT_CONFIGURED,
				last_sandbox_test: data.last_sandbox_test,
				last_production_test: data.last_production_test
			};
		} else {
			// Insert new record with default values
			const insertPayload = {
				user_id: userId,
				sandbox_status: environment === 'sandbox' ? status : FBR_API_STATUS.NOT_CONFIGURED,
				production_status: environment === 'production' ? status : FBR_API_STATUS.NOT_CONFIGURED,
				last_sandbox_test: environment === 'sandbox' ? now : null,
				last_production_test: environment === 'production' ? now : null,
				...updatePayload
			};

			const { data, error } = await supabase
				.from('fbr_api_configs')
				.insert(insertPayload)
				.select('sandbox_status, production_status, last_sandbox_test, last_production_test')
				.single();

			if (error) {
				throw new Error('Failed to insert FBR config record');
			}

			return {
				sandbox_status: data.sandbox_status || FBR_API_STATUS.NOT_CONFIGURED,
				production_status: data.production_status || FBR_API_STATUS.NOT_CONFIGURED,
				last_sandbox_test: data.last_sandbox_test,
				last_production_test: data.last_production_test
			};
		}
	} catch (error) {
		console.error('Error in updateFbrConnectionStatus:', error);
		throw error;
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

	// First check if a record exists
	const { data: existingRecord, error: checkError } = await supabase
		.from('fbr_api_configs')
		.select('id')
		.eq('user_id', userId)
		.single();

	if (checkError && checkError.code !== 'PGRST116') {
		throw new Error('Failed to check existing record');
	}

	if (existingRecord) {
		// Update existing record
		const { error } = await supabase
			.from('fbr_api_configs')
			.update(updatePayload)
			.eq('user_id', userId);

		if (error) {
			throw new Error('Failed to update credentials');
		}
	} else {
		// Insert new record
		const { error } = await supabase
			.from('fbr_api_configs')
			.insert({
				user_id: userId,
				...updatePayload
			});

		if (error) {
			throw new Error('Failed to insert credentials');
		}
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

		throw new Error('Failed to retrieve configuration status');
	}

	// Decrypt API keys if they exist
	let decryptedSandboxKey = null;
	let decryptedProductionKey = null;

	if (data.sandbox_api_key) {
		try {
			decryptedSandboxKey = await decryptGcm(data.sandbox_api_key);
		} catch {
			// Failed to decrypt sandbox API key
		}
	}

	if (data.production_api_key) {
		try {
			decryptedProductionKey = await decryptGcm(data.production_api_key);
		} catch {
			// Failed to decrypt production API key
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
		if (error.code === 'PGRST116') {
			console.warn(`Scenario ${scenarioId} not found`);
			return null;
		}
		throw error;
	}

	return data;
}

/**
 * Get scenario progress for a specific user and scenario
 */
export async function getScenarioProgress(userId: string, scenarioId: string): Promise<FbrScenarioProgress | null> {
	const { data, error } = await supabase
		.from('fbr_scenario_progress')
		.select('*')
		.eq('user_id', userId)
		.eq('scenario_id', scenarioId)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			return null; // No record found
		}
		throw error;
	}

	return data;
}

/**
 * Update scenario progress
 */
export async function updateScenarioProgress(
	userId: string,
	scenarioId: string,
	status: FbrScenarioStatus,
	fbrResponse?: string
): Promise<FbrScenarioProgressResult> {
	// First check if a record exists to get current attempts
	const { data: existingRecord, error: checkError } = await supabase
		.from('fbr_scenario_progress')
		.select('id, attempts')
		.eq('user_id', userId)
		.eq('scenario_id', scenarioId)
		.single();

	const currentAttempts = existingRecord?.attempts || 0;
	const newAttempts = currentAttempts + 1;

	const updatePayload: Partial<FbrScenarioProgress> = {
		status,
		attempts: newAttempts,
		last_attempt: new Date().toISOString(),
		updated_at: new Date().toISOString()
	};

	if (fbrResponse) {
		updatePayload.fbr_response = fbrResponse;
	}

	if (status === FBR_SCENARIO_STATUS.COMPLETED) {
		updatePayload.completion_timestamp = new Date().toISOString();
	}

	if (checkError && checkError.code !== 'PGRST116') {
		throw new Error('Failed to check existing scenario progress');
	}

	let data;
	let error;

	if (existingRecord) {
		// Update existing record
		const result = await supabase
			.from('fbr_scenario_progress')
			.update(updatePayload)
			.eq('user_id', userId)
			.eq('scenario_id', scenarioId)
			.select()
			.single();

		data = result.data;
		error = result.error;
	} else {
		// Insert new record
		const result = await supabase
			.from('fbr_scenario_progress')
			.insert({
				user_id: userId,
				scenario_id: scenarioId,
				...updatePayload
			})
			.select()
			.single();

		data = result.data;
		error = result.error;
	}

	if (error) {
		throw error;
	}

	return { ...data, newAttempts };
}

/**
 * Initialize scenario progress for a user based on their business activity
 * This should be called during onboarding when user selects their business activity
 */
export async function initializeScenarioProgress(userId: string, businessActivityId: number): Promise<void> {
	try {
		// Get all mandatory scenarios for this business activity
		const scenarios = await getMandatoryScenarios(businessActivityId);

		if (scenarios.length === 0) {
			console.log('No scenarios found for business activity:', businessActivityId);
			return;
		}

		// Create progress entries for each scenario
		const progressEntries = scenarios.map(scenario => ({
			user_id: userId,
			scenario_id: scenario.scenario_id,
			status: FBR_SCENARIO_STATUS.NOT_STARTED,
			attempts: 0,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString()
		}));

		// Insert all progress entries in a single batch
		const { error } = await supabase
			.from('fbr_scenario_progress')
			.insert(progressEntries);

		if (error) {
			console.error('Error initializing scenario progress:', error);
			throw new Error('Failed to initialize scenario progress');
		}

	} catch (error) {
		console.error('Error in initializeScenarioProgress:', error);
		throw error;
	}
}

/**
 * Update scenario progress when user changes their business activity
 * This will remove old progress entries and create new ones for the new business activity
 */
export async function updateScenarioProgressForNewBusinessActivity(userId: string, newBusinessActivityId: number): Promise<void> {
	try {
		// First, delete all existing progress entries for this user
		const { error: deleteError } = await supabase
			.from('fbr_scenario_progress')
			.delete()
			.eq('user_id', userId);

		if (deleteError) {
			console.error('Error deleting existing scenario progress:', deleteError);
			throw new Error('Failed to delete existing scenario progress');
		}

		// Then initialize new progress entries for the new business activity
		await initializeScenarioProgress(userId, newBusinessActivityId);

	} catch (error) {
		console.error('Error in updateScenarioProgressForNewBusinessActivity:', error);
		throw error;
	}
}



/**
 * Get filtered mandatory scenarios for a business activity with backend filtering
 */
export async function getFilteredMandatoryScenarios(
	businessActivityId: number,
	userId: string,
	filters: ScenarioFilters = {}
): Promise<ScenarioWithProgress[]> {
	let query = supabase
		.from('business_activity_scenario')
		.select('scenario_id, scenario!scenario_id (code, description, sale_type, category)')
		.eq('business_activity_id', businessActivityId);

	if (filters.category) query = query.eq('scenario.category', filters.category);
	if (filters.saleType) query = query.eq('scenario.sale_type', filters.saleType);
	if (filters.scenarioId) query = query.eq('scenario.code', filters.scenarioId);
	if (filters.searchTerm) {
		query = query.or(`scenario.description.ilike.%${filters.searchTerm}%,scenario.code.ilike.%${filters.searchTerm}%`);
	}

	const { data: scenarios, error } = await query;
	if (error) throw error;

	const progressMap = new Map<string, Pick<FbrScenarioProgress, 'scenario_id' | 'status' | 'attempts' | 'last_attempt' | 'completion_timestamp'>>();

	if (userId && scenarios?.length) {
		const { data: progress } = await supabase
			.from('fbr_scenario_progress')
			.select('scenario_id, status, attempts, last_attempt, completion_timestamp')
			.eq('user_id', userId)
			.in('scenario_id', scenarios.map(s => s.scenario_id));

		progress?.forEach(p => progressMap.set(String(p.scenario_id), p));
	}

	return (scenarios || []).map(item => {
		const progress = progressMap.get(String(item.scenario_id));
		const scenario = Array.isArray(item.scenario) ? item.scenario[0] : item.scenario;

		return {
			id: item.scenario_id,
			code: scenario?.code || '',
			category: scenario?.category || '',
			sale_type: scenario?.sale_type || '',
			description: scenario?.description || '',
			status: progress?.status || FBR_SCENARIO_STATUS.NOT_STARTED,
			attempts: progress?.attempts || 0,
			last_attempt: progress?.last_attempt || null,
			completion_timestamp: progress?.completion_timestamp || null
		};
	});
}

/**
 * Get a single scenario by ID
 */
export async function getScenarioById(
	scenarioId: string
): Promise<FbrScenario | null> {
	try {
		// Get the scenario by code
		const { data: scenarioData, error: scenarioError } = await supabase
			.from('scenario')
			.select('*')
			.eq('code', scenarioId)
			.single();

		if (scenarioError) {
			if (scenarioError.code === 'PGRST116') {
				console.warn(`Scenario ${scenarioId} not found`);
				return null;
			}
			throw scenarioError;
		}

		if (!scenarioData) {
			return null;
		}

		// Create the scenario object with default progress values
		const scenario: FbrScenario = {
			id: scenarioData.id,
			code: scenarioData.code,
			description: scenarioData.description,
			sale_type: scenarioData.sale_type,
			category: scenarioData.category,
			status: FBR_SCENARIO_STATUS.NOT_STARTED,
			attempts: 0,
			last_attempt: null,
			completion_timestamp: null
		};

		return scenario;
	} catch {
		return null;
	}
}

/**
 * Clean up incorrect scenario progress records (non-numeric IDs instead of numeric IDs)
 * This function should be run once to fix existing data
 */
export async function cleanupScenarioProgressData(userId: string): Promise<void> {
	try {
		// Get all progress records for the user
		const { data: progressRecords, error: progressError } = await supabase
			.from('fbr_scenario_progress')
			.select('*')
			.eq('user_id', userId);

		if (progressError) {
			console.error('Failed to get progress records for cleanup:', progressError);
			return;
		}

		// Find records with non-numeric scenario_id (these are incorrect)
		const nonNumericRecords = progressRecords?.filter(record =>
			!/^\d+$/.test(record.scenario_id) // Non-numeric values
		) || [];

		if (nonNumericRecords.length === 0) {
			console.log('No incorrect scenario progress records found');
			return;
		}

		console.log(`Found ${nonNumericRecords.length} incorrect scenario progress records to clean up`);

		// For each non-numeric record, try to find the corresponding scenario ID
		for (const record of nonNumericRecords) {
			try {
				// Get the scenario by code
				const { data: scenarioData, error: scenarioError } = await supabase
					.from('scenario')
					.select('id')
					.eq('code', record.scenario_id)
					.single();

				if (scenarioError) {
					if (scenarioError.code === 'PGRST116') {
						console.log(`Scenario not found for code ${record.scenario_id}, deleting progress record`);
						// Delete the incorrect record
						await supabase
							.from('fbr_scenario_progress')
							.delete()
							.eq('id', record.id);
						continue;
					}
					throw scenarioError;
				}

				if (!scenarioData) {
					console.log(`Scenario not found for code ${record.scenario_id}, deleting progress record`);
					// Delete the incorrect record
					await supabase
						.from('fbr_scenario_progress')
						.delete()
						.eq('id', record.id);
					continue;
				}

				// Check if a correct record already exists
				const { data: existingCorrectRecord } = await supabase
					.from('fbr_scenario_progress')
					.select('id')
					.eq('user_id', userId)
					.eq('scenario_id', scenarioData.id)
					.single();

				if (existingCorrectRecord) {
					// Correct record already exists, delete the incorrect one
					console.log(`Correct record exists for ID ${scenarioData.id}, deleting incorrect record ${record.scenario_id}`);
					await supabase
						.from('fbr_scenario_progress')
						.delete()
						.eq('id', record.id);
				} else {
					// Update the record to use the correct scenario ID
					console.log(`Updating record from ${record.scenario_id} to ${scenarioData.id}`);
					await supabase
						.from('fbr_scenario_progress')
						.update({ scenario_id: scenarioData.id })
						.eq('id', record.id);
				}
			} catch (error) {
				console.error(`Error processing record ${record.scenario_id}:`, error);
			}
		}

		console.log('Scenario progress data cleanup completed');
	} catch (error) {
		console.error('Error during scenario progress cleanup:', error);
	}
}
