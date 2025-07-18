import { supabase } from "@/shared/services/supabase/client";

// Get the company for a user by user ID
export async function getCompanyByUserId(userId: string) {
  console.log("getCompanyByUserId: Checking for company with userId:", userId);

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      console.log("getCompanyByUserId: No company found for user");
      return null;
    }
    console.error("Error fetching company:", error);
    throw error;
  }

  console.log("getCompanyByUserId: Company found:", data);
  return data;
}

// Create a new company
export async function createCompany({
  user_id,
  name,
  type,
  tax_id_number,
  filing_status,
  tax_year_end,
}: {
  user_id: string;
  name: string;
  type: string;
  tax_id_number?: string;
  filing_status?: string;
  tax_year_end?: string;
}) {
  console.log("createCompany: Creating company with data:", { user_id, name, type, tax_id_number, filing_status, tax_year_end });

  const { data, error } = await supabase
    .from("companies")
    .insert({
      user_id,
      name,
      type,
      tax_id_number,
      filing_status,
      tax_year_end,
      account_balance: 0.00,
      opening_balance: 0.00,
      closing_balance: 0.00,
      total_debit: 0.00,
      total_credit: 0.00,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating company:", error);
    throw error;
  }

  console.log("createCompany: Company created successfully:", data);
  return data;
}

// Update an existing company
export async function updateCompany(
  companyId: string,
  updates: Partial<{
    name: string;
    type: string;
    tax_id_number: string;
    filing_status: string;
    tax_year_end: string;
  }>
) {
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId);

  if (error) {
    console.error("Error updating company:", error);
    throw error;
  }
  return data;
}

export async function deleteCompanyById(companyId: string) {
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", companyId);

  if (error) {
    console.error("Error deleting company:", error);
    throw error;
  }

  return { success: true };
}

// Get companies assigned to a specific accountant
export async function getCompaniesByAccountantId(accountantId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("assigned_accountant_id", accountantId)
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching companies by accountant:", error);
    throw error;
  }
  return data;
}

// Get companies assigned to the current accountant user
export async function getMyClientCompanies() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First get the accountant record for the current user
    const { data: accountant, error: accountantError } = await supabase
      .from('accountants')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (accountantError || !accountant) {
      throw new Error('Accountant record not found');
    }

    // Then get companies assigned to this accountant
    return await getCompaniesByAccountantId(accountant.id);
  } catch (error) {
    console.error("Error fetching client companies:", error);
    throw error;
  }
} 