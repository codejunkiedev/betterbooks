import { supabase } from '@/shared/services/supabase/client';
import { getCurrentUser } from '@/shared/services/supabase/auth';

import { logger } from '@/shared/utils/logger';
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
    }).catch((error: unknown) => {
      logger.error('Background invoice processing error', error instanceof Error ? error : new Error(String(error)));
    });

    return { message: 'Invoice processing initiated in background' };
  } catch (error) {
    logger.error('Error initiating invoice processing', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
};