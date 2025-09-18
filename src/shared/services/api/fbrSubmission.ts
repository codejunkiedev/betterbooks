import { HttpClientApi } from "./http-client";
import { saveInvoice, generateFBRInvoiceNumber } from "../supabase/invoice";
import { FBRInvoiceData, InvoiceFormData, InvoiceItemCalculated } from "@/shared/types/invoice";
import { getScenarioById } from "@/shared/constants";

// FBR API endpoints
const FBR_ENDPOINTS = {
  sandbox: "https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb",
  production: "https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata",
} as const;

// HTTP client instance
const httpClient = new HttpClientApi();

export interface FBRSubmissionRequest {
  userId: string;
  invoiceData: FBRInvoiceData;
  environment: "sandbox" | "production";
  apiKey: string;
  maxRetries?: number;
  timeout?: number;
}

export interface FBRSubmissionResponse {
  success: boolean;
  data?: {
    fbrReference?: string;
    transactionId?: string;
    invoiceNumber?: string;
    response?: Record<string, unknown>;
    invoiceId?: string | undefined;
    generatedInvoiceRefNo?: string; // Add generated reference number
  };
  error?: string;
  attempt?: number;
}

/**
 * Convert InvoiceItemCalculated to FBR API format
 */
function convertItemToFBRFormat(item: InvoiceItemCalculated, saleType: string) {
  // Format rate as percentage string
  const formatRate = (rate: number): string => {
    return `${rate}%`;
  };

  // Format number to appropriate decimal places
  // Quantities can have up to 3 decimal places (e.g., 0.125 kg)
  // Monetary values use 2 decimal places
  const formatNumberToString = (value: number, isQuantity: boolean = false): string => {
    return isQuantity ? value.toFixed(3) : value.toFixed(2);
  };

  return {
    hsCode: item.hs_code,
    productDescription: item.item_name,
    rate: formatRate(item.tax_rate),
    uoM: item.uom_code,
    quantity: parseFloat(formatNumberToString(item.quantity, true)), // Quantity supports 3 decimal places
    totalValues: parseFloat(formatNumberToString(item.total_amount)),
    valueSalesExcludingST: parseFloat(formatNumberToString(item.value_sales_excluding_st)),
    fixedNotifiedValueOrRetailPrice: parseFloat(formatNumberToString(item.fixed_notified_value)),
    salesTaxApplicable: parseFloat(formatNumberToString(item.sales_tax)),
    salesTaxWithheldAtSource: 0.0, // Default value - should be calculated based on business rules
    extraTax: 0.0, // Default value - should be calculated based on business rules
    furtherTax: 0.0, // Default value - should be calculated based on business rules
    sroScheduleNo: item.is_third_schedule ? "3" : "", // Third schedule indicator
    fedPayable: 0.0, // Default value - should be calculated based on business rules
    discount: 0.0, // Default value - should be calculated based on business rules
    saleType: saleType, // Dynamic sale type from scenario
    sroItemSerialNo: "",
  };
}

/**
 * Generate a unique invoice reference number if not provided
 * FBR Standard Format: NTN-YYYY-MM-XXXXX
 * Example: 1234567-2025-01-00001
 */
export async function generateInvoiceRefNo(userId: string): Promise<string> {
  try {
    // Use current date for FBR reference number (not invoice date)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return await generateFBRInvoiceNumber(userId, year, month);
  } catch (error) {
    console.warn("Failed to generate FBR-compliant invoice number, using fallback:", error);
    // Fallback to simple format if FBR generation fails
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `INV-${timestamp}-${random}`;
  }
}

/**
 * Format invoice data according to FBR API requirements
 */
async function formatInvoiceDataForFBR(invoiceData: FBRInvoiceData, userId: string): Promise<Record<string, unknown>> {
  // Clean NTN/CNIC by removing non-digits
  const cleanNTNCNIC = (value: string) => value.replace(/\D/g, "");

  // Generate invoice reference number if not provided
  const invoiceRefNo = invoiceData.invoiceRefNo || (await generateInvoiceRefNo(userId));

  // Get scenario details to get the sale type
  let saleType = "Goods at standard rate (default)"; // Default fallback
  try {
    const scenario = getScenarioById(invoiceData.scenarioId);
    if (scenario && scenario.saleType) {
      saleType = scenario.saleType;
    }
  } catch (error) {
    console.warn("Failed to fetch scenario details, using default sale type:", error);
  }

  return {
    invoiceType: invoiceData.invoiceType || "Sale Invoice",
    invoiceDate: invoiceData.invoiceDate,
    sellerNTNCNIC: cleanNTNCNIC(invoiceData.sellerNTNCNIC),
    sellerBusinessName: invoiceData.sellerBusinessName,
    sellerProvince: invoiceData.sellerProvince,
    sellerAddress: invoiceData.sellerAddress,
    buyerNTNCNIC: cleanNTNCNIC(invoiceData.buyerNTNCNIC),
    buyerBusinessName: invoiceData.buyerBusinessName,
    buyerProvince: invoiceData.buyerProvince,
    buyerAddress: invoiceData.buyerAddress,
    buyerRegistrationType: invoiceData.buyerRegistrationType || "Registered",
    invoiceRefNo: invoiceRefNo,
    scenarioId: invoiceData.scenarioId,
    items: invoiceData.items.map((item) => convertItemToFBRFormat(item, saleType)),
  };
}

/**
 * Validate invoice data before submission
 */
function validateInvoiceData(invoiceData: FBRInvoiceData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  if (!invoiceData.invoiceType) errors.push("Invoice type is required");
  if (!invoiceData.invoiceDate) errors.push("Invoice date is required");
  if (!invoiceData.sellerNTNCNIC) errors.push("Seller NTN/CNIC is required");
  if (!invoiceData.sellerBusinessName) errors.push("Seller business name is required");
  if (!invoiceData.sellerProvince) errors.push("Seller province is required");
  if (!invoiceData.sellerAddress) errors.push("Seller address is required");
  if (!invoiceData.buyerNTNCNIC) errors.push("Buyer NTN/CNIC is required");
  if (!invoiceData.buyerBusinessName) errors.push("Buyer business name is required");
  if (!invoiceData.buyerProvince) errors.push("Buyer province is required");
  if (!invoiceData.buyerAddress) errors.push("Buyer address is required");
  if (!invoiceData.buyerRegistrationType) errors.push("Buyer registration type is required");
  if (!invoiceData.scenarioId) errors.push("Scenario ID is required");
  // Note: invoiceRefNo is optional and will be auto-generated if not provided

  // Items validation
  if (!invoiceData.items || invoiceData.items.length === 0) {
    errors.push("At least one item is required");
  } else {
    invoiceData.items.forEach((item, index) => {
      if (!item.hs_code) errors.push(`Item ${index + 1}: HS Code is required`);
      if (!item.item_name) errors.push(`Item ${index + 1}: Product description is required`);
      if (item.tax_rate <= 0) errors.push(`Item ${index + 1}: Tax rate must be greater than 0`);
      if (!item.uom_code) errors.push(`Item ${index + 1}: Unit of Measure is required`);
      if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      if (item.total_amount <= 0) errors.push(`Item ${index + 1}: Total amount must be greater than 0`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get user-friendly error message from FBR response
 */
function getFBRErrorMessage(status: number, responseData?: Record<string, unknown>): string {
  switch (status) {
    case 400:
      return (responseData?.message as string) || "Invalid request data - Please check your invoice details";
    case 401:
      return "Invalid API key - Please check your FBR credentials";
    case 403:
      return "API key not authorized - Contact FBR for access";
    case 404:
      return "FBR service endpoint not found";
    case 429:
      return "Rate limit exceeded - Please try again later";
    case 500:
      return "FBR server error - Please try again later";
    case 502:
    case 503:
    case 504:
      return "FBR service temporarily unavailable";
    default:
      return (responseData?.message as string) || `Unexpected error (${status})`;
  }
}

/**
 * Process FBR API response to determine success/failure
 */
function processFBRResponse(responseData: Record<string, unknown>): {
  isSuccess: boolean;
  invoiceNumber?: string;
  errorMessage?: string;
  errorCode?: string;
} {
  // Check for validation response structure (new format)
  if (responseData.validationResponse) {
    const validationResponse = responseData.validationResponse as Record<string, unknown>;

    if (validationResponse.statusCode === "00" && validationResponse.status === "Valid") {
      return {
        isSuccess: true,
        invoiceNumber: responseData.invoiceNumber as string,
      };
    } else {
      const errorCode = (validationResponse.errorCode as string) || "UNKNOWN";
      const errorMessage = (validationResponse.error as string) || "FBR validation failed";
      return {
        isSuccess: false,
        errorMessage: `FBR Validation Error (${errorCode}): ${errorMessage}`,
        errorCode,
      };
    }
  }

  // Check for legacy success indicators
  if (responseData.invoiceNumber || responseData.transactionId || responseData.referenceNumber) {
    return {
      isSuccess: true,
      invoiceNumber:
        (responseData.invoiceNumber as string) ||
        (responseData.transactionId as string) ||
        (responseData.referenceNumber as string),
    };
  }

  // Check for error indicators
  if (responseData.error || responseData.errorCode) {
    const errorCode = (responseData.errorCode as string) || "UNKNOWN";
    const errorMessage = (responseData.error as string) || "Unknown FBR error";
    return {
      isSuccess: false,
      errorMessage: `FBR API Error (${errorCode}): ${errorMessage}`,
      errorCode,
    };
  }

  // If we can't determine success/failure, assume success but log warning
  console.warn("Unable to determine FBR response status, assuming success:", responseData);
  return {
    isSuccess: true,
    invoiceNumber: "FBR-" + Date.now(),
  };
}

/**
 * Submit invoice to FBR with retry logic and timeout handling
 */
export async function submitInvoiceToFBR(params: FBRSubmissionRequest): Promise<FBRSubmissionResponse> {
  const { userId, invoiceData, environment, apiKey, maxRetries = 3, timeout = 90000 } = params;

  // Validate invoice data
  const validation = validateInvoiceData(invoiceData);
  if (!validation.isValid) {
    console.error("Invoice validation failed:", validation.errors);
    return {
      success: false,
      error: `Validation failed: ${validation.errors.join(", ")}`,
      attempt: 0,
    };
  }

  // Additional check for critical missing data
  if (!invoiceData.items || invoiceData.items.length === 0) {
    return {
      success: false,
      error: "No invoice items found. Please add at least one item to the invoice.",
      attempt: 0,
    };
  }

  // Check if total amount is zero
  const totalAmount = invoiceData.items.reduce((sum, item) => sum + item.total_amount, 0);
  if (totalAmount <= 0) {
    return {
      success: false,
      error: "Invoice total amount is zero or negative. Please check item quantities and prices.",
      attempt: 0,
    };
  }

  // Format invoice data for FBR
  const fbrInvoiceData = await formatInvoiceDataForFBR(invoiceData, userId);
  const endpoint = FBR_ENDPOINTS[environment];

  console.log("FBR Submission Request:", {
    endpoint,
    environment,
    invoiceData: invoiceData,
    fbrInvoiceData: fbrInvoiceData,
  });

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`FBR Submission Attempt ${attempt}/${maxRetries}`);

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), timeout);
      });

      // Create submission promise
      const submissionPromise = httpClient.request({
        method: "POST",
        url: endpoint,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        data: fbrInvoiceData,
      });

      // Race between submission and timeout
      const response = await Promise.race([submissionPromise, timeoutPromise]);

      // Process FBR response
      const responseData = response.data as Record<string, unknown>;
      const result = processFBRResponse(responseData);

      if (result.isSuccess) {
        // Convert FBR data to InvoiceFormData for database save
        // const invoiceFormData: InvoiceFormData = {
        //   ...invoiceData,
        //   totalAmount: invoiceData.items.reduce((sum, item) => sum + item.total_amount, 0),
        //   notes: "",
        // };
        // Save invoice to database
        // const saveResult = await saveInvoice(userId, invoiceFormData, responseData);
        // if (!saveResult.success) {
        //   console.error("Failed to save invoice:", saveResult.error);
        //   return {
        //     success: false,
        //     error: "Invoice submitted to FBR but failed to save locally",
        //     attempt,
        //     data: {
        //       response: responseData,
        //       generatedInvoiceRefNo: fbrInvoiceData.invoiceRefNo as string, // Return the generated reference number
        //     },
        //   };
        // }
        // const data: FBRSubmissionResponse["data"] = {
        //   response: responseData,
        //   invoiceId: saveResult.invoiceId,
        //   generatedInvoiceRefNo: fbrInvoiceData.invoiceRefNo as string, // Return the generated reference number
        // };
        // if (result.invoiceNumber) {
        //   data.fbrReference = result.invoiceNumber;
        //   data.transactionId = result.invoiceNumber;
        //   data.invoiceNumber = result.invoiceNumber;
        // }
        return {
          success: true,
          attempt,
        };
      } else {
        // FBR validation/processing failed
        return {
          success: false,
          error: result.errorMessage || "FBR processing failed",
          attempt,
          data: {
            response: responseData,
            generatedInvoiceRefNo: fbrInvoiceData.invoiceRefNo as string, // Return the generated reference number even on error
          },
        };
      }
    } catch (error: unknown) {
      console.error(`FBR Submission Attempt ${attempt} failed:`, error);

      let errorMessage = "Failed to submit invoice to FBR";

      // Handle different types of errors
      if (error instanceof Error && error.message === "Request timeout") {
        errorMessage = "Request timeout - FBR server took too long to respond";
      } else if (error && typeof error === "object" && "response" in error) {
        const errorObj = error as { response: { status: number; data: unknown } };
        const status = errorObj.response.status;
        errorMessage = getFBRErrorMessage(status, errorObj.response.data as Record<string, unknown>);
      } else if (error && typeof error === "object" && "request" in error) {
        errorMessage = "No response received from FBR - Please check your internet connection";
      } else if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      // If this is the last attempt, return error
      if (attempt === maxRetries) {
        return {
          success: false,
          error: errorMessage,
          attempt,
        };
      }

      // Wait before retrying with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10 seconds
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    error: "Maximum retry attempts exceeded",
    attempt: maxRetries,
  };
}

/**
 * Log submission attempt to database
 */
export async function logSubmissionAttempt(
  userId: string,
  invoiceId: string,
  attempt: number,
  status: "success" | "failed",
  response: Record<string, unknown>,
  error?: string
): Promise<void> {
  try {
    // This would typically go to a submission_logs table
    // For now, we'll just log to console
    console.log("Submission Log:", {
      userId,
      invoiceId,
      attempt,
      status,
      response,
      error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log submission attempt:", error);
  }
}

/**
 * Get submission statistics for dashboard
 */
export async function getSubmissionStats(): Promise<{
  totalSubmissions: number;
  successfulSubmissions: number;
  failedSubmissions: number;
  successRate: number;
}> {
  try {
    // This would typically query the database
    // For now, return mock data
    return {
      totalSubmissions: 0,
      successfulSubmissions: 0,
      failedSubmissions: 0,
      successRate: 0,
    };
  } catch (error) {
    console.error("Failed to get submission stats:", error);
    return {
      totalSubmissions: 0,
      successfulSubmissions: 0,
      failedSubmissions: 0,
      successRate: 0,
    };
  }
}
