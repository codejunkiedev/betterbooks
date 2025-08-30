import { supabase } from '@/shared/services/supabase/client';
import { ActivityType } from '@/shared/types/activity';
import { logActivity } from '@/shared/utils/activity';
import { CompanyType } from '@/shared/constants/company';

export async function getCompanyByUserId(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching company:", error);
    throw error;
  }
  return data;
}

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
  type: CompanyType;
  tax_id_number?: string;
  filing_status?: string;
  tax_year_end?: string;
}) {

  const { data, error } = await supabase
    .from("companies")
    .insert({
      user_id,
      name,
      type,
      tax_id_number,
      filing_status,
      tax_year_end,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating company:", error);
    console.error("Error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  console.log("Company created successfully:", data);
  return data;
}

export async function updateCompany(
  companyId: string,
  updates: Partial<{
    name: string;
    type: CompanyType;
    tax_id_number: string;
    filing_status: string;
    tax_year_end: string;
  }>
) {
  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", companyId)
    .select();

  if (error) {
    console.error("Error updating company:", error);
    throw error;
  }
  return data;
}

export async function getCompanyById(companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching company:", error);
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

// Update company status (activate/deactivate)
export async function updateCompanyStatus(companyId: string, isActive: boolean) {
  // Get current user for activity logging
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("companies")
    .update({ is_active: isActive })
    .eq("id", companyId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("Error updating company status:", error);
    throw error;
  }

  // Log activity for company status change
  try {
    const activityType = isActive ? ActivityType.COMPANY_ACTIVATED : ActivityType.COMPANY_DEACTIVATED;
    await logActivity(
      companyId,
      user?.id || null,
      activityType,
      user?.email || 'unknown',
      'company_status_update',
      {
        company_name: data?.name || 'Unknown Company',
        previous_status: !isActive,
        new_status: isActive,
        updated_by: user?.email || 'Unknown'
      }
    );
  } catch (activityError) {
    // Don't fail the status update if activity logging fails
    console.error('Failed to log company status change activity:', activityError);
  }

  return data;
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
      .from("accountants")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
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

// Get paginated accountant clients with backend filtering
export async function getPaginatedAccountantClients(
  page: number,
  itemsPerPage: number,
  filters?: {
    search?: string;
    status?: 'all' | 'active' | 'inactive' | 'pending_review';
  }
): Promise<{
  data: {
    items: Array<{
      id: string;
      name: string;
      type: string;
      is_active: boolean;
      created_at: string;
      user_id: string;
      pendingDocumentsCount: number;
      status: 'active' | 'inactive' | 'pending_review';
    }>;
    total: number;
    page: number;
    itemsPerPage: number;
    totalPages: number;
  } | null;
  error: Error | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First get the accountant record for the current user
    const { data: accountant, error: accountantError } = await supabase
      .from("accountants")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (accountantError) throw accountantError;
    if (!accountant) throw new Error('Accountant not found or inactive');

    // Get accountant's assigned clients
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select(`
                id,
                name,
                type,
                is_active,
                created_at,
                user_id
            `, { count: 'exact' })
      .eq("assigned_accountant_id", accountant.id);

    if (companiesError) throw companiesError;

    // Get pending documents count for all clients
    const { data: pendingCounts, error: pendingError } = await supabase
      .from("documents")
      .select("company_id, status")
      .in("company_id", companies?.map(c => c.id) || [])
      .eq("status", "PENDING_REVIEW");

    if (pendingError) throw pendingError;

    // Create pending count map
    const pendingCountMap = new Map<string, number>();
    pendingCounts?.forEach(doc => {
      const count = pendingCountMap.get(doc.company_id) || 0;
      pendingCountMap.set(doc.company_id, count + 1);
    });

    // Process companies and add status
    let processedClients = (companies || []).map(company => {
      const pendingCount = pendingCountMap.get(company.id) || 0;
      let status: 'active' | 'inactive' | 'pending_review' = 'active';

      if (!company.is_active) {
        status = 'inactive';
      } else if (pendingCount > 0) {
        status = 'pending_review';
      }

      return {
        ...company,
        pendingDocumentsCount: pendingCount,
        status
      };
    });

    // Apply filters
    if (filters?.search) {
      processedClients = processedClients.filter(client =>
        client.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters?.status && filters.status !== 'all') {
      processedClients = processedClients.filter(client => client.status === filters.status);
    }

    const total = processedClients.length;
    const totalPages = Math.ceil(total / itemsPerPage);

    // Apply pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    const paginatedClients = processedClients.slice(from, to);

    return {
      data: {
        items: paginatedClients,
        total,
        page,
        itemsPerPage,
        totalPages
      },
      error: null
    };
  } catch (error) {
    console.error("Error fetching paginated accountant clients:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// Get paginated bank statement clients with backend filtering
export async function getPaginatedBankStatementClients(
  page: number,
  itemsPerPage: number,
  filters?: {
    search?: string;
    status?: 'all' | 'with_statements' | 'without_statements';
  }
): Promise<{
  data: {
    items: Array<{
      id: string;
      name: string;
      type: string;
      is_active: boolean;
      created_at: string;
      user_id: string;
      bankStatements: Array<{
        id: string;
        original_filename: string;
        uploaded_at: string;
        status: string;
      }>;
      statementsCount: number;
      lastUpload?: string;
    }>;
    total: number;
    page: number;
    itemsPerPage: number;
    totalPages: number;
  } | null;
  error: Error | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First get the accountant record for the current user
    const { data: accountant, error: accountantError } = await supabase
      .from("accountants")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (accountantError) throw accountantError;
    if (!accountant) throw new Error('Accountant not found or inactive');

    // Get accountant's assigned clients
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select(`
                id,
                name,
                type,
                is_active,
                created_at,
                user_id
            `)
      .eq("assigned_accountant_id", accountant.id);

    if (companiesError) throw companiesError;

    // Get bank statements for all clients
    const { data: allStatements, error: statementsError } = await supabase
      .from("documents")
      .select(`
                id,
                company_id,
                original_filename,
                uploaded_at,
                status
            `)
      .in("company_id", companies?.map(c => c.id) || [])
      .eq("type", "BANK_STATEMENT");

    if (statementsError) throw statementsError;

    // Create statements map by company
    const statementsMap = new Map<string, Array<{
      id: string;
      original_filename: string;
      uploaded_at: string;
      status: string;
    }>>();

    allStatements?.forEach(statement => {
      const existing = statementsMap.get(statement.company_id) || [];
      statementsMap.set(statement.company_id, [...existing, statement]);
    });

    // Process companies and add bank statement data
    let processedClients = (companies || []).map(company => {
      const bankStatements = statementsMap.get(company.id) || [];
      const statementsCount = bankStatements.length;
      const lastUpload = bankStatements.length > 0
        ? bankStatements[0].uploaded_at
        : undefined;

      const result = {
        id: company.id,
        name: company.name,
        type: company.type,
        is_active: company.is_active,
        created_at: company.created_at,
        user_id: company.user_id,
        bankStatements,
        statementsCount,
        ...(lastUpload && { lastUpload })
      };

      return result;
    });

    // Apply filters
    if (filters?.search) {
      processedClients = processedClients.filter(client =>
        client.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters?.status && filters.status !== 'all') {
      if (filters.status === 'with_statements') {
        processedClients = processedClients.filter(client => client.statementsCount > 0);
      } else if (filters.status === 'without_statements') {
        processedClients = processedClients.filter(client => client.statementsCount === 0);
      }
    }

    const total = processedClients.length;
    const totalPages = Math.ceil(total / itemsPerPage);

    // Apply pagination
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;
    const paginatedClients = processedClients.slice(from, to);

    return {
      data: {
        items: paginatedClients,
        total,
        page,
        itemsPerPage,
        totalPages
      },
      error: null
    };
  } catch (error) {
    console.error("Error fetching paginated bank statement clients:", error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}