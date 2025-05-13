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

// Add OCR response type definitions
interface MistralOCRResponse {
  pages: Array<{
    index: number;
    markdown: string;
  }>;
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
const mistralApiKey =  'Gj38vvaAgl92OyNqC2HeMDSjSpeFt20z' //Deno.env.get('MISTRAL_API_KEY');

if (!supabaseUrl || !supabaseKey || !mistralApiKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, or MISTRAL_API_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

class OCRProcessingError extends Error {
  constructor(
    message: string, 
    public imageUrl: string, 
    public originalError?: Error,
    public urlInfo?: { url: string; isAccessible: boolean; publicUrl: string }
  ) {
    super(message);
    this.name = 'OCRProcessingError';
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
  const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(filePath);
  
  if (!publicUrl) {
    throw new Error(`Failed to generate public URL for file: ${filePath}`);
  }

  // Create a signed URL with 1-week expiration
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
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
 * Process image with Mistral OCR
 */
async function processImageWithMistralOCR(imageUrl: string): Promise<MistralOCRResponse> {
  try {
    console.log(`Sending OCR request to Mistral API for URL: ${imageUrl}`);
    
    const response = await fetch('https://api.mistral.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mistralApiKey}`
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document: {
          type: "image_url",
          image_url: imageUrl
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error(`Mistral OCR API error response:`, errorData);
      throw new OCRProcessingError(
        `Mistral OCR API error: ${response.statusText}${errorData ? ` - ${JSON.stringify(errorData)}` : ''}`,
        imageUrl
      );
    }

    const result = await response.json();
    if (!result || !result.pages) {
      throw new OCRProcessingError('Invalid OCR response format', imageUrl);
    }

    return result;
  } catch (error) {
    if (error instanceof OCRProcessingError) {
      throw error;
    }
    throw new OCRProcessingError(
      `Failed to process image with OCR: ${error instanceof Error ? error.message : 'Unknown error'}`,
      imageUrl,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Updates the status of an invoice
 */
async function updateInvoiceStatus(id: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase
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
 * Updates invoice with OCR response
 */
async function updateInvoiceWithOCRResponse(invoiceId: string, response: MistralOCRResponse): Promise<void> {
  try {
    const { error } = await supabase
      .from('invoices')
      .update({
        ocr_response: response,
        status: 'processing'
      })
      .eq('id', invoiceId);

    if (error) {
      throw new InvoiceProcessingError(
        `Failed to save OCR response: ${error.message}`,
        invoiceId
      );
    }
  } catch (error) {
    if (error instanceof InvoiceProcessingError) {
      throw error;
    }
    throw new InvoiceProcessingError(
      `Failed to save OCR response: ${error instanceof Error ? error.message : 'Unknown error'}`,
      invoiceId,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Processes a single invoice by fetching its image and processing with OCR
 */
async function processInvoice(invoice: Invoice): Promise<{ url: string; isAccessible: boolean; publicUrl: string }> {
  try {
    // Update status to indicate processing has started
    await updateInvoiceStatus(invoice.id, 'processing');
    
    // Get an accessible URL for the invoice file
    const { url: accessibleUrl, isAccessible, publicUrl } = await getAccessibleFileUrl(invoice.file.path);

    console.log(`Processing invoice ${invoice.id} with URL: ${accessibleUrl}`);
    
    // Process with OCR using the accessible URL
    const ocrResult = await processImageWithMistralOCR(accessibleUrl);
    
    // Update invoice with OCR response
    await updateInvoiceWithOCRResponse(invoice.id, ocrResult);

    console.log(`OCR processing completed for invoice ${invoice.id}:`, {
      invoiceId: invoice.id,
      pages: ocrResult.pages.length,
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

    // If we have URL information from before the error, include it in the error
    if (error instanceof OCRProcessingError) {
      throw new OCRProcessingError(
        error.message,
        error.imageUrl,
        error.originalError,
        { url: error.imageUrl, isAccessible: true, publicUrl: error.imageUrl }
      );
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
    // Parse and validate request body
    const body: ProcessInvoiceRequest = await req.json();
    
    if (!body.user_id) {
      return createResponse(
        { error: 'Missing required field: user_id' },
        400
      );
    }

    // Fetch pending invoices for the user
    const { data: invoices, error } = await supabase
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
            ...(error instanceof OCRProcessingError && error.urlInfo ? {
              url: error.urlInfo.url,
              isAccessible: error.urlInfo.isAccessible,
              publicUrl: error.urlInfo.publicUrl
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

2. Start Supabase CLI:
   supabase start

3. Test the function:
   curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-invoice' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"user_id":"test-user-123"}'
*/