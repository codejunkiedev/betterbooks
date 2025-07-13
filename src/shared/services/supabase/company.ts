import { supabase } from "@/shared/services/supabase/client";

// Get the company for a user by user ID
export async function getCompanyByUserId(userId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    console.error("Error fetching company:", error);
    throw error;
  }
  return data;
}

// Create a new company
export async function createCompany({
  user_id,
  name,
  type,
}: {
  user_id: string;
  name: string;
  type: string;
}) {
  const { data, error } = await supabase
    .from("companies")
    .insert({
      user_id,
      name,
      type,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating company:", error);
    throw error;
  }

  return data;
}

// Update an existing company
export async function updateCompany(
  companyId: string,
  updates: Partial<{
    name: string;
    type: string;
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