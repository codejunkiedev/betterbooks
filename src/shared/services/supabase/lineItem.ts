import { supabase } from './client';
import { ApiResponse } from '@/shared/types';
import { LineItem, CreateLineItemData } from '@/shared/types';


import { logger } from '@/shared/utils/logger';
export const createLineItem = async (
  data: CreateLineItemData
): Promise<ApiResponse<LineItem>> => {
  try {
    const { data: lineItem, error } = await supabase
      .from('line_items')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return {
      data: lineItem,
      error: null
    };
  } catch (error) {
    logger.error('Error creating line item:', error instanceof Error ? error : new Error(String(error)));
    return {
      data: null,
      error: error as Error
    };
  }
};

export const getInvoiceLineItems = async (
  invoiceId: string
): Promise<ApiResponse<LineItem[]>> => {
  try {
    const { data: lineItems, error } = await supabase
      .from('line_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (error) throw error;

    return {
      data: lineItems,
      error: null
    };
  } catch (error) {
    logger.error('Error fetching line items:', error instanceof Error ? error : new Error(String(error)));
    return {
      data: null,
      error: error as Error
    };
  }
}; 