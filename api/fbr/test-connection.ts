import { createClient } from '@supabase/supabase-js';

const SANDBOX_URL = 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb';
const PRODUCTION_URL = 'https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata';

const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

interface TestConnectionBody {
  apiKey: string;
  environment: 'sandbox' | 'production';
  userId?: string; // uuid
}

interface SimpleResponse { success: boolean; message: string }

export default async function handler(req: { method?: string; body?: unknown }, res: { status: (code: number) => { json: (body: SimpleResponse) => void } }) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  let payload: TestConnectionBody | null = null;
  try {
    const raw = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as object);
    payload = raw as TestConnectionBody;
  } catch {
    res.status(400).json({ success: false, message: 'Invalid JSON body' });
    return;
  }

  const apiKey = payload?.apiKey;
  const environment = payload?.environment;
  const userId = payload?.userId;

  if (!apiKey || (environment !== 'sandbox' && environment !== 'production')) {
    res.status(400).json({ success: false, message: 'Missing or invalid apiKey/environment' });
    return;
  }

  const baseUrl = environment === 'sandbox' ? SANDBOX_URL : PRODUCTION_URL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (response.status === 200) {
      // Best-effort status update if we have server creds and a numeric userId
      if (supabase && typeof userId === 'string' && userId.length > 0) {
        const now = new Date().toISOString();
        const updatePayload: { updated_at: string; sandbox_status?: string; production_status?: string; last_sandbox_test?: string; last_production_test?: string } = { updated_at: now };
        if (environment === 'sandbox') {
          updatePayload.sandbox_status = 'connected';
          updatePayload.last_sandbox_test = now;
        } else {
          updatePayload.production_status = 'connected';
          updatePayload.last_production_test = now;
        }
        try {
          await supabase.from('fbr_api_configs').update(updatePayload).eq('user_id', userId);
        } catch (err) {
          console.error('Failed to update fbr_api_configs:', err);
        }
      }

      res.status(200).json({ success: true, message: 'Connection Successful' });
      return;
    }

    if (response.status === 401) {
      res.status(200).json({ success: false, message: 'Invalid API key' });
      return;
    }

    if (response.status === 403) {
      res.status(200).json({ success: false, message: 'API key not authorized' });
      return;
    }

    res.status(200).json({ success: false, message: `Unexpected error: ${response.status}` });
  } catch (error) {
    // Handle timeout specifically
    if ((error as { name?: string })?.name === 'AbortError') {
      res.status(200).json({ success: false, message: 'Connection timeout - please try again' });
      return;
    }

    res.status(200).json({ success: false, message: 'Unexpected error: network_error' });
  }
} 