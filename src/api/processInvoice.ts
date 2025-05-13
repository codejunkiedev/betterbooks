import { supabase } from '../lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';

export const processInvoiceFunction = async () => {
  try {
    const user = await getCurrentUser();    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Fire and forget - don't wait for response
    supabase.functions.invoke('process-invoice', {
      body: { user_id: user.id }
    }).catch(error => {
      console.error('Background invoice processing error:', error);
    });

    return { message: 'Invoice processing initiated in background' };
  } catch (error) {
    console.error('Error initiating invoice processing:', error);
    throw error;
  }
};