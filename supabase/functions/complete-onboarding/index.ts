import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Get request data
    const { user_id, company_data, fbr_data, opening_balance, skip_balance, skip_tax_info } = await req.json();
    // Validate required fields
    if (!user_id || !company_data?.name || !company_data?.type) {
      throw new Error("Missing required fields: user_id, company name, or company type");
    }
    // Track created resources for rollback
    const createdResources = {
      company: null,
      coaCopied: false,
      openingBalanceCreated: false,
      fbrProfileCreated: false,
      scenarioProgressInitialized: false,
    };
    try {
      // Validate opening balance first (if provided)
      if (!skip_balance && opening_balance?.amount && opening_balance?.date) {
        const amount = opening_balance.amount;
        const balanceDate = new Date(opening_balance.date);
        const today = new Date();
        // Validate amount
        if (amount <= 0) {
          throw new Error("Opening balance must be greater than 0");
        }
        // Validate date (should not be in the future)
        if (balanceDate > today) {
          throw new Error("Opening balance date cannot be in the future");
        }
      }
      // Step 1: Create company
      const companyInsertData = {
        user_id: user_id,
        name: company_data.name,
        type: company_data.type,
        assigned_accountant_id: "",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (!skip_tax_info) {
        if (company_data.tax_id_number) companyInsertData.tax_id_number = company_data.tax_id_number;
        if (company_data.filing_status) companyInsertData.filing_status = company_data.filing_status;
        if (company_data.tax_year_end) {
          // Handle date conversion
          try {
            companyInsertData.tax_year_end = new Date(company_data.tax_year_end).toISOString().split("T")[0];
          } catch {
            console.warn("Invalid tax_year_end date format:", company_data.tax_year_end);
            // Continue without tax_year_end if invalid
          }
        }
      }
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert(companyInsertData)
        .select()
        .single();
      if (companyError) {
        throw new Error(`Company creation failed: ${companyError.message}`);
      }
      createdResources.company = company;
      // Step 2: Copy COA template to company
      const { error: coaError } = await supabase.from("company_coa").insert(
        supabase
          .from("coa_templates")
          .select("account_code, account_name, account_type, parent_account_id, is_active")
          .eq("is_active", true)
          .then((result) => {
            if (result.error) throw result.error;
            return (
              result.data?.map((template) => ({
                company_id: company.id,
                account_code: template.account_code,
                account_name: template.account_name,
                account_type: template.account_type,
                parent_account_id: template.parent_account_id,
                is_active: template.is_active,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })) || []
            );
          })
      );
      if (coaError) {
        throw new Error(`COA copy failed: ${coaError.message}`);
      }
      createdResources.coaCopied = true;
      // Step 3: Handle opening balance
      if (!skip_balance && opening_balance?.amount && opening_balance?.date) {
        const amount = opening_balance.amount;
        const balanceDate = opening_balance.date;
        // Create journal entry
        const { data: journalEntry, error: journalError } = await supabase
          .from("journal_entries")
          .insert({
            company_id: company.id,
            entry_date: balanceDate,
            description: "Opening Balance",
            is_adjusting_entry: false,
            created_by: user_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (journalError) {
          throw new Error(`Journal entry creation failed: ${journalError.message}`);
        }
        // Find cash account (account_code = '1000')
        const { data: cashAccount, error: cashError } = await supabase
          .from("company_coa")
          .select("id")
          .eq("company_id", company.id)
          .eq("account_code", "1000")
          .single();
        if (cashError || !cashAccount) {
          throw new Error("Cash account not found for opening balance");
        }
        // Find equity account (account_code = '3000')
        const { data: equityAccount, error: equityError } = await supabase
          .from("company_coa")
          .select("id")
          .eq("company_id", company.id)
          .eq("account_code", "3000")
          .single();
        if (equityError || !equityAccount) {
          throw new Error("Equity account not found for opening balance");
        }
        // Create journal entry lines
        const { error: linesError } = await supabase.from("journal_entry_lines").insert([
          {
            journal_entry_id: journalEntry.id,
            account_id: cashAccount.id,
            type: "DEBIT",
            amount: amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            journal_entry_id: journalEntry.id,
            account_id: equityAccount.id,
            type: "CREDIT",
            amount: amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        if (linesError) {
          throw new Error(`Journal entry lines creation failed: ${linesError.message}`);
        }
        createdResources.openingBalanceCreated = true;
      }
      // Step 4: Handle FBR profile
      if (fbr_data?.cnic_ntn && fbr_data?.business_name) {
        try {
          // Check if CNIC/NTN already exists for different user
          const { data: existingProfile, error: checkError } = await supabase
            .from("fbr_profiles")
            .select("user_id")
            .eq("cnic_ntn", fbr_data.cnic_ntn)
            .neq("user_id", user_id)
            .single();
          if (checkError && checkError.code !== "PGRST116") {
            throw new Error(`FBR profile check failed: ${checkError.message}`);
          }
          if (existingProfile) {
            throw new Error(`CNIC/NTN ${fbr_data.cnic_ntn} is already registered by another user`);
          }
          // Create FBR profile
          const { error: fbrError } = await supabase
            .from("fbr_profiles")
            .insert({
              user_id: user_id,
              cnic_ntn: fbr_data.cnic_ntn,
              business_name: fbr_data.business_name,
              province_code: fbr_data.province_code,
              address: fbr_data.address,
              mobile_number: fbr_data.mobile_number,
              business_activity_id: fbr_data.business_activity_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();
          if (fbrError) {
            throw new Error(`FBR profile creation failed: ${fbrError.message}`);
          }
          createdResources.fbrProfileCreated = true;
          // Initialize scenario progress for mandatory scenarios
          const { data: scenarios, error: scenariosError } = await supabase
            .from("fbr_scenarios")
            .select("id")
            .eq("business_activity_id", fbr_data.business_activity_id)
            .eq("is_mandatory", true);
          if (scenariosError) {
            throw new Error(`Scenarios fetch failed: ${scenariosError.message}`);
          }
          if (scenarios && scenarios.length > 0) {
            const scenarioProgressData = scenarios.map((scenario) => ({
              user_id: user_id,
              business_activity_id: fbr_data.business_activity_id,
              scenario_id: scenario.id,
              status: "PENDING",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
            const { error: progressError } = await supabase.from("fbr_scenario_progress").insert(scenarioProgressData);
            if (progressError) {
              throw new Error(`Scenario progress initialization failed: ${progressError.message}`);
            }
            createdResources.scenarioProgressInitialized = true;
          }
        } catch (fbrError) {
          console.error("FBR profile creation failed:", fbrError);
          // Handle specific FBR errors
          if (fbrError.message?.includes("CNIC/NTN") && fbrError.message?.includes("already registered")) {
            // Continue with onboarding without FBR profile
            console.log("Continuing onboarding without FBR profile due to CNIC/NTN conflict");
          } else {
            // For other FBR errors, rollback everything
            throw fbrError;
          }
        }
      }
      // Step 5: Log activity for company creation
      const { data: activity, error: activityError } = await supabase
        .from("activity_logs")
        .insert({
          company_id: company.id,
          user_id: user_id,
          activity_type: "COMPANY_CREATED",
          description: "Company created during onboarding",
          metadata: {
            company_name: company_data.name,
            company_type: company_data.type,
            has_opening_balance: !skip_balance && opening_balance?.amount,
            opening_balance_amount: opening_balance?.amount || 0,
            opening_balance_date: opening_balance?.date || null,
            has_fbr_profile: createdResources.fbrProfileCreated,
          },
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (activityError) {
        console.warn("Activity logging failed:", activityError.message);
        // Don't fail onboarding for activity logging issues
      }
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            company_id: company.id,
            company_name: company_data.name,
            fbr_profile_id: createdResources.fbrProfileCreated ? "created" : null,
            journal_entry_id: createdResources.openingBalanceCreated ? "created" : null,
            activity_id: activity?.id || null,
            has_opening_balance: createdResources.openingBalanceCreated,
            opening_balance_amount: opening_balance?.amount || 0,
            opening_balance_date: opening_balance?.date || null,
            has_fbr_profile: createdResources.fbrProfileCreated,
          },
          message: "Onboarding completed successfully",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    } catch (error) {
      // Rollback logic - delete created resources in reverse order
      console.error("Onboarding error, rolling back:", error);
      if (createdResources.scenarioProgressInitialized) {
        await supabase
          .from("fbr_scenario_progress")
          .delete()
          .eq("user_id", user_id)
          .eq("business_activity_id", fbr_data?.business_activity_id);
      }
      if (createdResources.fbrProfileCreated) {
        await supabase.from("fbr_profiles").delete().eq("user_id", user_id).eq("cnic_ntn", fbr_data?.cnic_ntn);
      }
      if (createdResources.openingBalanceCreated) {
        // Delete journal entries and lines
        await supabase
          .from("journal_entries")
          .delete()
          .eq("company_id", createdResources.company?.id)
          .eq("description", "Opening Balance");
      }
      if (createdResources.coaCopied) {
        await supabase.from("company_coa").delete().eq("company_id", createdResources.company?.id);
      }
      if (createdResources.company) {
        await supabase.from("companies").delete().eq("id", createdResources.company.id);
      }
      throw error;
    }
  } catch (error) {
    console.error("Onboarding error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
