import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';
export const processInvoice = async () => {
  try {
    const user = await getCurrentUser();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No active session found');
    }

    supabase.functions.invoke('process-invoice', {
      body: { user_id: user.id },
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    }).catch(error => {
      console.error('Background invoice processing error:', error);
    });

    return { message: 'Invoice processing initiated in background' };
  } catch (error) {
    console.error('Error initiating invoice processing:', error);
    throw error;
  }
};