import { FbrScenarioStatus } from "../constants/fbr";

export interface FbrScenario {
  id: string;
  code: string;
  description: string;
  sale_type: string;
  category: string;
  transaction_type_id?: number;
  status: FbrScenarioStatus;
  attempts: number;
  last_attempt: string | null;
  completion_timestamp: string | null;
}

export interface ScenarioFilters {
  searchTerm?: string;
  category?: string;
  saleType?: string;
  scenarioId?: string;
}

export interface ScenarioWithProgress {
  id: string;
  code: string;
  category: string;
  sale_type: string;
  description: string;
  transaction_type_id?: number;
  status: FbrScenarioStatus;
  attempts: number;
  last_attempt: string | null;
  completion_timestamp: string | null;
}

export interface FbrScenarioProgress {
  id: number;
  user_id: string;
  scenario_id: string;
  status: FbrScenarioStatus;
  attempts: number;
  last_attempt: string | null;
  fbr_response: string | null;
  completion_timestamp: string | null;
  created_at: string;
  updated_at: string;
}

export interface FbrScenarioProgressResult extends FbrScenarioProgress {
  newAttempts: number;
}

export interface FbrConfigStatus {
  sandbox_status: string;
  production_status: string;
  last_sandbox_test?: string;
  last_production_test?: string;
  sandbox_api_key?: string | null;
  production_api_key?: string | null;
}

export interface FbrProfile {
  user_id: string;
  cnic_ntn: string;
  business_name: string;
  province_code: number;
  address: string;
  mobile_number: string;
  activities: string[];
  sectors: string[];
  created_at: string;
  updated_at: string;
}

export interface UserBusinessActivity {
  id: string;
  user_id: string;
  business_activity_type_id: number;
  sector_id: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  // Joined data from business_activity_types and sectors tables
  business_activity_name?: string;
  sector_name?: string;
}

export interface BusinessActivityType {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Sector {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

// Actual database table interfaces
export interface BusinessActivityScenario {
  id: number;
  business_activity_type_id: number;
  sector_id: number;
  scenario_id: number;
  created_at: string;
}

// Legacy interface for backward compatibility - will be removed
export interface BusinessActivity {
  id: number;
  sr: number;
  business_activity: string;
  sector: string;
}

// Legacy interface for backward compatibility - will be removed
export interface BusinessActivitySectorCombination {
  id: number;
  sr: number;
  business_activity: string;
  sector: string;
  business_activity_description?: string;
  sector_description?: string;
}

export interface UserBusinessActivitySelection {
  business_activity_type_ids: number[];
  sector_ids: number[];
  combinations: Array<{
    business_activity_type_id: number;
    business_activity_name: string;
    business_activity_description: string | null;
    sector_id: number;
    sector_name: string;
    sector_description: string | null;
    is_primary: boolean;
  }>;
  primary_business_activity_type_id?: number;
  primary_sector_id?: number;
}

export type FbrProfilePayload = {
  user_id: string;
  cnic_ntn: string;
  business_name: string;
  province_code: number;
  address: string;
  mobile_number: string;
  business_activity_type_id?: number; // Primary business activity type
  sector_id?: number; // Primary sector
  business_activities?: Array<{
    business_activity_type_id: number;
    sector_id: number | null;
    is_primary: boolean;
  }>; // Multiple business activities
  ntn_number?: string;
  strn_number?: string;
};

export interface FbrSandboxTestRequest {
  scenarioId: string;
  invoiceData: {
    invoiceType: string;
    invoiceDate: string;
    sellerNTNCNIC: string;
    sellerBusinessName: string;
    sellerProvince: string;
    sellerAddress: string;
    buyerNTNCNIC: string;
    buyerBusinessName: string;
    buyerProvince: string;
    buyerAddress: string;
    buyerRegistrationType: string;
    invoiceRefNo: string;
    items: Array<{
      hsCode: string;
      productDescription: string;
      rate: number;
      uoM: string;
      quantity: number;
      totalValues: number;
      valueSalesExcludingST: number;
      fixedNotifiedValueOrRetailPrice: number;
      salesTaxApplicable: number;
      salesTaxWithheldAtSource: number;
      extraTax: number;
      furtherTax: number;
      sroScheduleNo: string;
      fedPayable: number;
      discount: number;
      saleType: string;
      sroItemSerialNo: string;
    }>;
    totalAmount: number;
    notes: string;
    [key: string]: unknown;
  };
  userId: string;
}

export interface FbrSandboxTestResponse {
  success: boolean;
  message: string;
  data?: {
    fbrResponse: unknown;
    scenarioId: string;
    status: FbrScenarioStatus;
    timestamp?: string;
    errorDetails?: string;
  };
}

/**
 * Response from FBR SaleTypeToRate API
 * This API returns available tax rates based on transaction type, date, and seller province
 */
export interface SaleTypeToRateResponse {
  ratE_ID: number; // Unique rate identifier
  ratE_DESC: string; // Rate description (e.g., "18% along with rupees 60 per kilogram") can be Rs.100, 5% or Exempt
  ratE_VALUE: number; // Tax rate percentage value
}

/**
 * Parameters for SaleTypeToRate API call
 */
export interface SaleTypeToRateParams {
  date: string; // Invoice date in YYYY-MM-DD format
  transTypeId: number; // Type of transaction (18 = standard goods sale)
  originationSupplier: number; // Province ID of seller
}

/**
 * Response from FBR SroSchedule API
 * This API returns SRO schedule details for a specific rate ID and date
 */
export interface SroScheduleResponse {
  srO_ID: number; // SRO identifier
  serNo: number; // SRO serial number
  srO_DESC: string;
}

/**
 * Parameters for SroSchedule API call
 */
export interface SroScheduleParams {
  rateId: number; // Rate identifier
  date: string; // Date in DD-MMM-YYYY format (e.g., "30-Sep-2025")
  originationSupplier: number; // Province ID of supplier
}

/**
 * Response from FBR SROItem API
 * This API returns SRO item details for a specific SRO and date
 */
export interface SroItemResponse {
  srO_ITEM_ID: number; // SRO item identifier
  srO_ITEM_DESC: string; // SRO item description
}

/**
 * Parameters for SROItem API call
 */
export interface SroItemParams {
  date: string; // Date in YYYY-MM-DD format
  sroId: number; // SRO identifier
}
