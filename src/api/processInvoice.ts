import { supabase } from '@/shared/services/supabase/client';
import { getCurrentUser } from '@/shared/services/supabase/auth';
export const processInvoice = async () => {
  try {
    const { user, error } = await getCurrentUser();
    const { data: { session } } = await supabase.auth.getSession();

    if (error || !user) {
      throw new Error('User not authenticated');
    }

    if (!session?.access_token) {
      throw new Error('No active session found');
    }

    supabase.functions.invoke('process-invoice', {
      body: { user_id: user.id },
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    }).catch((error: unknown) => {
      console.error('Background invoice processing error:', error);
    });

    return { message: 'Invoice processing initiated in background' };
  } catch (error) {
    console.error('Error initiating invoice processing:', error);
    throw error;
  }
};