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