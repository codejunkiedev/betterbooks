import { supabase } from './client';
import { ApiResponse } from '../../interfaces/api';
import { LineItem, CreateLineItemData } from '../../interfaces/line-item';

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
    console.error('Error creating line item:', error);
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
    console.error('Error fetching line items:', error);
    return {
      data: null,
      error: error as Error
    };
  }
}; 