import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
const FBR_TEST_ENDPOINT = "https://gw.fbr.gov.pk/pdi/v1/itemdesccode";
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    const { apiKey, environment, userId } = await req.json();
    if (!apiKey || !environment || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required parameters: apiKey, environment, userId",
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
    // Test FBR API connection
    const fbrResponse = await fetch(FBR_TEST_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    console.log("fbrResponse", fbrResponse.body);
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    if (fbrResponse.ok) {
      // Connection successful - update status in database
      const { error: updateError } = await supabase.from("fbr_api_configs").upsert({
        user_id: userId,
        [`${environment}_status`]: "connected",
        [`last_${environment}_test`]: new Date().toISOString(),
      });
      if (updateError) {
        console.error("Failed to update connection status:", updateError);
      }
      // Get updated config status
      const { data: configStatus, error: fetchError } = await supabase
        .from("fbr_api_configs")
        .select("sandbox_status, production_status, last_sandbox_test, last_production_test")
        .eq("user_id", userId)
        .single();
      if (fetchError) {
        console.error("Failed to fetch config status:", fetchError);
      }
      return new Response(
        JSON.stringify({
          success: true,
          message: "Connection Successful - FBR API is accessible",
          data: {
            status: "connected",
            configStatus: configStatus || null,
          },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    } else {
      // Connection failed - update status in database
      const { error: updateError } = await supabase.from("fbr_api_configs").upsert({
        user_id: userId,
        [`${environment}_status`]: "failed",
        [`last_${environment}_test`]: new Date().toISOString(),
      });
      if (updateError) {
        console.error("Failed to update connection status:", updateError);
      }
      // Get updated config status
      const { data: configStatus, error: fetchError } = await supabase
        .from("fbr_api_configs")
        .select("sandbox_status, production_status, last_sandbox_test, last_production_test")
        .eq("user_id", userId)
        .single();
      if (fetchError) {
        console.error("Failed to fetch config status:", fetchError);
      }
      const errorMessage = getFbrErrorMessage(fbrResponse.status);
      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage,
          data: {
            status: "failed",
            configStatus: configStatus || null,
            originalError: `HTTP ${fbrResponse.status}: ${fbrResponse.statusText}`,
          },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error testing FBR connection:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error while testing connection",
        data: {
          status: "failed",
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
function getFbrErrorMessage(status) {
  const messages = {
    401: "Invalid API key - Please check your credentials",
    403: "API key not authorized - Contact FBR for access",
    404: "FBR service endpoint not found",
    405: "Method not allowed - CORS issue detected",
    429: "Rate limit exceeded - Please try again later",
    500: "FBR server error - Please try again later",
    502: "FBR service temporarily unavailable",
    503: "FBR service temporarily unavailable",
    504: "FBR service temporarily unavailable",
  };
  return messages[status] || `Unexpected error (${status})`;
}
