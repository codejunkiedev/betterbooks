import { DEFAULT_ALLOWED_ORIGINS } from './constants.ts'

function parseAllowedOriginsFromEnv(): string[] {
    const envValue = (typeof Deno !== 'undefined' ? Deno.env.get('ALLOWED_ORIGINS') : undefined) || '';
    if (!envValue) return [];
    return envValue
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0);
}

export function getAllowedOrigins(): string[] {
    const fromEnv = parseAllowedOriginsFromEnv();
    return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED_ORIGINS;
}

export function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;
    try {
        const url = new URL(origin);
        return getAllowedOrigins().some((allowed) => {
            try {
                const a = new URL(allowed);
                return a.protocol === url.protocol && a.host === url.host;
            } catch {
                return allowed === origin;
            }
        });
    } catch {
        return false;
    }
}

export function getCorsHeaders(req?: Request): Record<string, string> {
    const origin = req?.headers?.get('Origin') ?? '';
    const allowOrigin = isOriginAllowed(origin) ? origin : 'null';
    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin',
    };
}

export function handleCorsOptions(req: Request): Response {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
}

export function getAppBaseUrl(): string {
    const baseUrl = Deno.env.get('APP_BASE_URL');
    if (!baseUrl) {
        throw new Error('Missing APP_BASE_URL environment variable');
    }
    return baseUrl;
}

export async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmailWithRetry(to: string, subject: string, html: string, maxAttempts: number = 3): Promise<void> {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) throw new Error('Missing RESEND_API_KEY environment variable');

    let attempt = 0;
    let lastError: string | null = null;

    while (attempt < maxAttempts) {
        attempt++;
        const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'BetterBooks <noreply@usebetterbooks.com>',
                to: [to],
                subject,
                html,
            }),
        });

        if (resp.ok) return;

        const text = await resp.text().catch(() => '');
        lastError = text || resp.statusText;

        // Handle 429 rate limit with backoff
        if (resp.status === 429) {
            const retryAfter = Number(resp.headers.get('retry-after'));
            const waitMs = !isNaN(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 700 * attempt;
            await sleep(waitMs);
            continue;
        }

        // For other errors, small delay then retry
        await sleep(300 * attempt);
    }

    throw new Error(`Failed to send email after ${maxAttempts} attempts: ${lastError ?? 'unknown error'}`);
} 