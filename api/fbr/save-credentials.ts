import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// AES-256-GCM encryption helpers
function getKey(): Buffer {
	const secret = process.env.ENCRYPTION_KEY || '';
	return createHash('sha256').update(secret).digest();
}

export function encrypt(plaintext: string): string {
	const key = getKey();
	const iv = randomBytes(12); // GCM nonce size
	const cipher = createCipheriv('aes-256-gcm', key, iv);
	const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const authTag = cipher.getAuthTag();
	return `${iv.toString('base64')}:${ciphertext.toString('base64')}:${authTag.toString('base64')}`;
}

export function decrypt(token: string): string {
	const key = getKey();
	const [ivB64, ctB64, tagB64] = token.split(':');
	const iv = Buffer.from(ivB64, 'base64');
	const ciphertext = Buffer.from(ctB64, 'base64');
	const authTag = Buffer.from(tagB64, 'base64');
	const decipher = createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(authTag);
	const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
	return plaintext.toString('utf8');
}

// Initialize Supabase client using server-side credentials
const SUPABASE_URL = process.env.SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false },
});

interface SaveCredentialsBody {
	sandboxKey?: string;
	productionKey?: string;
	userId: string; // Supabase auth/profiles UUID
}

interface SimpleResponse {
	success: boolean;
	message: string;
}

export default async function handler(req: { method?: string; body?: unknown }, res: { status: (code: number) => { json: (body: SimpleResponse) => void } }) {
	if (req.method !== 'POST') {
		res.status(405).json({ success: false, message: 'Method not allowed' });
		return;
	}

	if (!process.env.ENCRYPTION_KEY) {
		res.status(500).json({ success: false, message: 'Server config error: missing ENCRYPTION_KEY' });
		return;
	}
	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
		res.status(500).json({ success: false, message: 'Server config error: missing Supabase credentials' });
		return;
	}

	let body: SaveCredentialsBody;
	try {
		const raw = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as object);
		body = raw as SaveCredentialsBody;
	} catch {
		res.status(400).json({ success: false, message: 'Invalid JSON body' });
		return;
	}

	const { sandboxKey, productionKey, userId } = body || {} as SaveCredentialsBody;
	if (typeof userId !== 'string' || userId.length === 0) {
		res.status(400).json({ success: false, message: 'Invalid userId' });
		return;
	}
	if (sandboxKey == null && productionKey == null) {
		res.status(400).json({ success: false, message: 'Nothing to save: provide sandboxKey and/or productionKey' });
		return;
	}

	type UpdatePayload = {
		updated_at: string;
		sandbox_api_key?: string;
		production_api_key?: string;
	};
	const updatePayload: UpdatePayload = { updated_at: new Date().toISOString() };
	if (typeof sandboxKey === 'string') {
		updatePayload.sandbox_api_key = encrypt(sandboxKey);
	}
	if (typeof productionKey === 'string') {
		updatePayload.production_api_key = encrypt(productionKey);
	}

	// Try update first
	const { data: updated, error: updateError } = await supabase
		.from('fbr_api_configs')
		.update(updatePayload)
		.eq('user_id', userId)
		.select('id');

	if (updateError) {
		res.status(500).json({ success: false, message: 'Failed to save credentials' });
		return;
	}

	if (Array.isArray(updated) && updated.length > 0) {
		res.status(200).json({ success: true, message: 'Credentials saved successfully' });
		return;
	}

	// If no row updated, insert new
	const insertPayload: { user_id: string; sandbox_api_key?: string; production_api_key?: string } = { user_id: userId };
	if (updatePayload.sandbox_api_key) insertPayload.sandbox_api_key = updatePayload.sandbox_api_key;
	if (updatePayload.production_api_key) insertPayload.production_api_key = updatePayload.production_api_key;

	const { error: insertError } = await supabase
		.from('fbr_api_configs')
		.insert(insertPayload);

	if (insertError) {
		res.status(500).json({ success: false, message: 'Failed to save credentials' });
		return;
	}

	res.status(200).json({ success: true, message: 'Credentials saved successfully' });
} 