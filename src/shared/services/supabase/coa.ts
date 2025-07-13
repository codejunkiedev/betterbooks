import { COATemplate, CompanyCOA } from "@/shared/types";
import { supabase } from "./client";
import { PostgrestError } from "@supabase/supabase-js";



import { logger } from '@/shared/utils/logger';
export async function getCOATemplate(): Promise<{ data: COATemplate[] | null; error: PostgrestError | null }> {
  try {
    const { data, error } = await supabase
      .from("coa_template")
      .select("*")
      .order("id");

    if (error) {
      logger.error("Error fetching COA template:", error instanceof Error ? error : new Error(String(error)));
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    logger.error("Error fetching COA template:", error instanceof Error ? error : new Error(String(error)));
    return { data: null, error: error as PostgrestError };
  }
}

export async function copyCOATemplateToCompany(companyId: string): Promise<{ data: CompanyCOA[] | null; error: PostgrestError | null }> {
  try {
    const { data: templateData, error: templateError } = await getCOATemplate();

    if (templateError || !templateData) {
      throw new Error("Failed to fetch COA template");
    }
    const coaEntries = templateData.map(template => ({
      template_id: template.id,
      account_id: template.account_id,
      account_name: template.account_name,
      account_type: template.account_type,
      parent_id: template.parent_id,
      company_id: companyId,
      credit_balance: 0,
      debit_balance: 0
    }));

    const { data, error } = await supabase
      .from("company_coa")
      .insert(coaEntries)
      .select();

    if (error) {
      logger.error("Error inserting COA entries:", error instanceof Error ? error : new Error(String(error)));
      throw new Error("Failed to copy COA template");
    }

    return { data, error: null };
  } catch (error) {
    logger.error("Error copying COA template to company:", error instanceof Error ? error : new Error(String(error)));
    return { data: null, error: error as PostgrestError };
  }
}

// Get company COA entries
export async function getCompanyCOA(companyId: string): Promise<{ data: CompanyCOA[] | null; error: PostgrestError | null }> {
  try {
    const { data, error } = await supabase
      .from("company_coa")
      .select("*")
      .eq("company_id", companyId)
      .order("template_id"); // Order by template_id to maintain template order

    if (error) {
      logger.error("Error fetching company COA:", error instanceof Error ? error : new Error(String(error)));
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    logger.error("Error fetching company COA:", error instanceof Error ? error : new Error(String(error)));
    return { data: null, error: error as PostgrestError };
  }
} 