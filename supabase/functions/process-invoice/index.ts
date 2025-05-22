/**
 * Supabase Edge Function: Process Invoice
 * 
 * Retrieves pending invoices for a user and initiates background processing
 * for each invoice by fetching images from storage and updating status.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Type definitions
export interface ProcessInvoiceRequest {
  user_id: string;
}

export interface Invoice {
  id: string;
  file: { path: string };
  user_id: string;
  status: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// DeepSeek response type definitions
interface LineItemSuggestion {
  description: string;
  amount: number;
  quantity: number;
  unit_price?: number;
  is_asset: boolean;
  asset_type?: string;
  asset_life_months?: number;
}

interface DeepSeekResponse {
  debitAccount: string;
  creditAccount: string;
  amount: number;
  confidence: number;
  explanation: string;
  line_items?: LineItemSuggestion[];
}

// Constants
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
} as const;

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
const openRouterApiKey = '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' // Deno.env.get('OPENROUTER_API_KEY');

if (!supabaseUrl || !supabaseKey || !openRouterApiKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, or OPENROUTER_API_KEY');
}

// Create two Supabase clients - one for admin operations and one for user operations
const adminClient = createClient(supabaseUrl, supabaseKey);
let userClient: ReturnType<typeof createClient> | null = null;

// Function to initialize user client with JWT
function initUserClient(jwt: string) {
  userClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`
      }
    }
  });
}

/**
 * HTTP Response helper functions
 */
const createResponse = <T = unknown>(
  body: ApiResponse<T>,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
  });
};

// Custom error classes for better error handling
class InvoiceProcessingError extends Error {
  constructor(message: string, public invoiceId: string, public originalError?: Error) {
    super(message);
    this.name = 'InvoiceProcessingError';
  }
}

async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    return response.ok;
  } catch (error) {
    console.error(`URL validation error for ${url}:`, error);
    return false;
  }
}

/**
 * Uploads the file contents to a temporary file-sharing service
 * or processes the file directly if the public URL is accessible
 */
async function getAccessibleFileUrl(filePath: string): Promise<{ url: string; isAccessible: boolean; publicUrl: string }> {
  // Generate the public URL
  const { data: { publicUrl } } = adminClient.storage.from('invoices').getPublicUrl(filePath);
  
  if (!publicUrl) {
    throw new Error(`Failed to generate public URL for file: ${filePath}`);
  }

  // Create a signed URL with 1-week expiration
  const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
    .from('invoices')
    .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 1 week expiration
    
  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${signedUrlError?.message || 'No URL returned'}`);
  }
  
  // Check if the original public URL is accessible (just for logging purposes)
  const isAccessible = await isUrlAccessible(publicUrl);
  
  // The signed URL already contains the token parameter as needed
  const accessibleUrl = signedUrlData.signedUrl;
  
  // Log the URL for debugging
  console.log(`Generated signed URL for ${filePath}: ${accessibleUrl}`);
  
  // Return the signed URL as the accessible URL
  return { 
    url: accessibleUrl, 
    isAccessible,
    publicUrl
  };
}

/**
 * Updates the status of an invoice
 */
async function updateInvoiceStatus(id: string, status: string): Promise<boolean> {
  try {
    const { error } = await adminClient
      .from('invoices')
      .update({ status })
      .eq('id', id);

    if (error) {
      throw new InvoiceProcessingError(
        `Database error updating status to ${status}: ${error.message}`,
        id
      );
    }

    return true;
  } catch (error) {
    if (error instanceof InvoiceProcessingError) {
      throw error;
    }
    throw new InvoiceProcessingError(
      `Failed to update invoice status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      id,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Analyzes invoice using DeepSeek via OpenRouter
 */
async function analyzeWithDeepSeek(imageUrl: string): Promise<DeepSeekResponse> {
  try {
    console.log('Sending invoice analysis request to DeepSeek via OpenRouter');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'https://betterbooks-git-develop-cj-devs-projects.vercel.app',
        'X-Title': 'BetterBooks'
      },
      body: JSON.stringify({
        model: "mistralai/mistral-small-3.1-24b-instruct:free",
        messages: [
          {
            role: 'system',
            content: "You are an AI accounting assistant. Your primary task is to process invoices by extracting relevant information, categorizing the invoice, and determining the appropriate accounting treatment for the items listed, including suggesting debit and credit accounts at both invoice and line item levels. You will encounter invoices in English and Urdu, but all your responses and recorded data must be in English only. Your entire response must be a single, valid JSON object.\n\nCore Accounting Principles for Item Classification:\n1.  Assets:\n    * These are resources owned by the company that are expected to provide future economic benefit for more than one year (one accounting period).\n    * Examples: Machinery, Office equipment (e.g., computers, printers, furniture if >1 year life and >$500), Vehicles, Buildings, Software licenses (long-term, >1 year).\n2.  Expenses (Fees or Perishable Items):\n    * These are costs incurred for goods or services that are consumed, or whose benefits are realized, within one year or less.\n    * Examples: Service fees, Subscription fees (short-term), Office supplies, Perishable goods, Utilities, Rent, Fuel, Minor tools.\n\nDecision Logic for Line Items:\n* Useful Life: Will the item provide benefits for more than one year? If yes, likely an 'Asset'. If no, it's an 'Expense'.\n* Materiality/Cost Threshold: For items with >1 year life, if cost is below a company-defined threshold (e.g., $500, assume this if not specified), it may be treated as an 'Expense'.\n\nBasic Accounting Guidance for Debit/Credit Accounts:\n* Line Item Level:\n    * Purchasing Assets: Debit specific Asset account (e.g., 'Office Equipment', 'Vehicles'), Credit 'Cash', 'Bank', or 'Accounts Payable'.\n    * Incurring Expenses: Debit specific Expense account (e.g., 'Fuel Expense', 'Office Supplies Expense', 'Rent Expense'), Credit 'Cash', 'Bank', or 'Accounts Payable'.\n* Invoice Level (for the total amount):\n    * `invoice_level_credit_account`: Typically 'Accounts Payable' if the invoice is a bill for future payment. If it represents an immediate payment (e.g., a cash fuel receipt), use 'Cash' or 'Bank'.\n    * `invoice_level_debit_account`: If the invoice predominantly covers a single category (e.g., all line items are 'Fuel Expense'), use that account (e.g., 'Fuel Expense'). If line items are diverse, use a summary term like 'Various Expenses', 'Multiple Categories', or the most significant category if discernible. This reflects what the total payment obligation is for.\n* If payment method is unclear for line items, align with the invoice-level assessment (e.g., if invoice is on credit, line items likely credit 'Accounts Payable' indirectly).\n\nInformation to Extract & Generate:\n1.  Invoice Header & Summary:\n    * `vendor_name`: Extracted vendor name.\n    * `invoice_number`: Extracted invoice number.\n    * `invoice_date`: Extracted invoice date.\n    * `due_date`: Extracted due date (if present, else null).\n    * `total_amount`: Extracted total invoice amount (numeric).\n    * `currency`: Extracted currency code (e.g., PKR, USD).\n    * `invoice_summary_description`: A brief (1-2 sentence) overall description you generate about the invoice's purpose.\n    * `overall_invoice_confidence_score`: A decimal value (0.0-1.0) you generate, representing your confidence in accurately processing the entire invoice.\n    * `invoice_level_debit_account`: Your suggested primary debit account for the invoice total, based on guidance.\n    * `invoice_level_credit_account`: Your suggested credit account for the invoice total, based on guidance (e.g., 'Accounts Payable', 'Cash').\n2.  Line Items (for each discernible line item on the invoice):\n    * `description`: Extracted line item description.\n    * `quantity`: Extracted quantity (numeric).\n    * `unit_price`: Extracted unit price (numeric, if available).\n    * `total_price`: Extracted total price for the line item (numeric).\n    * `classification`: Your classification as 'Asset' or 'Expense'.\n    * `justification`: Brief justification for the classification.\n    * `debit_account`: Your suggested debit account for this line item.\n    * `credit_account`: Your suggested credit account for this line item.\n    * `line_item_confidence_score`: A decimal value (0.0-1.0) you generate for this specific line item's processing accuracy.\n\nOutput Format:\nYour entire response MUST be a single, valid JSON object. No text outside this JSON. The JSON should include the invoice header & summary fields (including invoice-level debit/credit accounts) at the root. It must also include a `line_items` array containing objects for each processed line item. If no line items are found, `line_items` should be an empty array."
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: "Hello AI Accountant. Please process the following invoice image strictly according to all instructions, accounting principles, and output specifications outlined in your system context.\n\n1.  **Analyze the provided invoice image.**\n2.  **Extract and Generate Key Invoice Information:** Extract vendor name, invoice number, invoice date, due date (if any), total amount, and currency. Also, generate a concise `invoice_summary_description`, an `overall_invoice_confidence_score` for your processing of this entire invoice, and determine the overall `invoice_level_debit_account` and `invoice_level_credit_account` for the invoice total based on its nature (e.g., bill vs. immediate payment) and content.\n3.  **Process Each Line Item:** For each discernible line item on the invoice (skip blank or irrelevant lines):\n    * Extract its `description`, `quantity`, `unit_price` (if available), and `total_price`.\n    * Classify the item as either 'Asset' or 'Expense' based on the principles provided, and provide a `justification`.\n    * Suggest appropriate `debit_account` and `credit_account` for the line item based on standard accounting practices and the guidance provided.\n    * Generate a `line_item_confidence_score` (0.0-1.0) reflecting your confidence in the accuracy of this specific line item's processing (extraction, classification, and D/C account suggestion).\n4.  **Language Handling:** If the invoice contains Urdu text, ensure all extracted information and generated descriptions in the final JSON output are in English.\n5.  **Response Format:** Respond ONLY with a single, complete, and valid JSON object as per the detailed structure specified in your system context. Ensure all monetary values are numbers. The `line_items` array should contain an object for each processed line item."
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 5000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      throw new Error(`OpenRouter API error: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`);
    }

    const result = await response.json();
    const content = result.choices[0].message.content;
    
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in response');
      }
      
      const jsonStr = jsonMatch[0];
      const parsedResponse = JSON.parse(jsonStr);
      
      // Map the response to our expected format
      const response: DeepSeekResponse = {
        debitAccount: parsedResponse.invoice_level_debit_account,
        creditAccount: parsedResponse.invoice_level_credit_account,
        amount: parsedResponse.total_amount,
        confidence: parsedResponse.overall_invoice_confidence_score,
        explanation: parsedResponse.invoice_summary_description,
        line_items: parsedResponse.line_items?.map(item => ({
          description: item.description,
          amount: item.total_price,
          quantity: item.quantity,
          unit_price: item.unit_price,
          is_asset: item.classification === 'Asset',
          asset_type: item.debit_account,
          asset_life_months: 12 // Default to 12 months for assets
        }))
      };

      return response;
    } catch (parseError) {
      console.error('Failed to parse response:', {
        content,
        error: parseError.message
      });
      throw new Error(`Failed to parse OpenRouter response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('OpenRouter analysis error:', error);
    throw error;
  }
}

/**
 * Updates invoice with DeepSeek analysis and line items
 */
async function updateInvoiceWithDeepSeekAnalysis(invoiceId: string, analysis: DeepSeekResponse): Promise<void> {
  try {
    // First update the invoice with the analysis using admin client
    const { error: updateError } = await adminClient
      .from('invoices')
      .update({
        deepseek_response: analysis,
        status: 'completed'
      })
      .eq('id', invoiceId);

    if (updateError) {
      throw new InvoiceProcessingError(
        `Failed to save DeepSeek analysis: ${updateError.message}`,
        invoiceId
      );
    }

    // If there are line items and they are assets, save them using user client
    if (analysis.line_items && Array.isArray(analysis.line_items)) {
      const assetLineItems = analysis.line_items.filter(item => item.classification === 'Asset');
      
      if (assetLineItems.length > 0) {
        if (!userClient) {
          throw new Error('User client not initialized');
        }

        const { error: lineItemsError } = await userClient
          .from('line_items')
          .insert(
            assetLineItems.map(item => ({
              invoice_id: invoiceId,
              description: item.description,
              amount: item.total_price,
              quantity: item.quantity,
              unit_price: item.unit_price,
              is_asset: true,
              asset_type: item.debit_account,
              asset_life_months: 12 // Default to 12 months for assets
            }))
          );

        if (lineItemsError) {
          throw new InvoiceProcessingError(
            `Failed to save line items: ${lineItemsError.message}`,
            invoiceId
          );
        }
      }
    }
  } catch (error) {
    if (error instanceof InvoiceProcessingError) {
      throw error;
    }
    throw new InvoiceProcessingError(
      `Failed to save DeepSeek analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
      invoiceId,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Processes a single invoice by fetching its image and processing with DeepSeek
 */
async function processInvoice(invoice: Invoice): Promise<{ url: string; isAccessible: boolean; publicUrl: string }> {
  try {
    // Update status to indicate processing has started
    await updateInvoiceStatus(invoice.id, 'processing');
    
    // Get an accessible URL for the invoice file
    const { url: accessibleUrl, isAccessible, publicUrl } = await getAccessibleFileUrl(invoice.file.path);

    console.log(`Processing invoice ${invoice.id} with URL: ${accessibleUrl}`);
    
    // Analyze with DeepSeek
    const accountingAnalysis = await analyzeWithDeepSeek(accessibleUrl);

    // Update invoice with DeepSeek analysis
    await updateInvoiceWithDeepSeekAnalysis(invoice.id, accountingAnalysis);

    console.log(`Processing completed for invoice ${invoice.id}:`, {
      invoiceId: invoice.id,
      analysis: accountingAnalysis,
      timestamp: new Date().toISOString()
    });

    return { url: accessibleUrl, isAccessible, publicUrl };

  } catch (error) {
    console.error(`Error processing invoice ${invoice.id}:`, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    });

    // Update status to failed
    try {
      await updateInvoiceStatus(invoice.id, 'failed');
    } catch (statusError) {
      console.error(`Failed to update status to 'failed' for invoice ${invoice.id}:`, {
        error: statusError instanceof Error ? {
          name: statusError.name,
          message: statusError.message,
          stack: statusError.stack
        } : statusError,
        timestamp: new Date().toISOString()
      });
    }

    // Re-throw the original error for the caller to handle
    throw error;
  }
}

/**
 * Main handler function
 */
Deno.serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: CORS_HEADERS,
    });
  }

  // Validate HTTP method
  if (req.method !== 'POST') {
    return createResponse(
      { error: 'Method not allowed. Use POST.' },
      405
    );
  }

  try {
    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createResponse(
        { error: 'Missing Authorization header' },
        401
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    initUserClient(jwt);

    // Parse and validate request body
    const body: ProcessInvoiceRequest = await req.json();
    
    if (!body.user_id) {
      return createResponse(
        { error: 'Missing required field: user_id' },
        400
      );
    }

    // Fetch pending invoices for the user
    const { data: invoices, error } = await adminClient
      .from('invoices')
      .select('*')
      .eq('user_id', body.user_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching invoices:', {
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint
        },
        userId: body.user_id,
        timestamp: new Date().toISOString()
      });
      
      return createResponse(
        { error: 'Failed to fetch invoices. Please try again later.' },
        500
      );
    }

    if (!invoices || invoices.length === 0) {
      return createResponse(
        { 
          message: 'No pending invoices found for this user',
          data: { count: 0 }
        }
      );
    }

    // Process all invoices in parallel using Promise.allSettled
    const processingPromises = invoices.map(invoice => 
      processInvoice(invoice)
        .then(({ url, isAccessible, publicUrl }) => ({ 
          invoiceId: invoice.id, 
          success: true,
          url,
          isAccessible,
          publicUrl
        }))
        .catch(error => ({ 
          invoiceId: invoice.id, 
          success: false, 
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            ...(error instanceof InvoiceProcessingError && error.invoiceId ? {
              invoiceId: error.invoiceId,
              error: error.originalError ? {
                name: error.name,
                message: error.message,
                stack: error.stack
              } : error.originalError
            } : {})
          } : error
        }))
    );

    const results = await Promise.allSettled(processingPromises);
    
    // Extract results from Promise.allSettled
    const processedResults = results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          invoiceId: 'unknown',
          success: false,
          error: result.reason
        };
      }
    });

    const failedInvoices = processedResults.filter(r => !r.success);
    
    if (failedInvoices.length > 0) {
      console.error('Some invoices failed to process:', {
        failedCount: failedInvoices.length,
        totalCount: invoices.length,
        failedInvoices,
        timestamp: new Date().toISOString()
      });
    }

    return createResponse(
      { 
        message: `Processing completed for ${invoices.length} invoice(s)`,
        data: { 
          count: invoices.length,
          successCount: invoices.length - failedInvoices.length,
          failedCount: failedInvoices.length,
          results: processedResults
        }
      },
      200 // OK - processing has been completed
    );

  } catch (error) {
    console.error('Request processing error:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: new Date().toISOString()
    });
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return createResponse(
        { error: 'Invalid JSON in request body' },
        400
      );
    }

    // Generic error handler
    return createResponse(
      { error: 'Internal server error' },
      500
    );
  }
});

/*
Local Development Instructions:

1. Set up environment variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - MISTRAL_API_KEY
   - OPENROUTER_API_KEY

2. Start Supabase CLI:
   supabase start

3. Test the function:
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-invoice' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"user_id":"test-user-123"}'
*/