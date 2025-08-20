// Browser-compatible encryption using Web Crypto API

// Get key for encryption (uses SHA-256 hash)
async function getKey(): Promise<CryptoKey> {
    const keyStr = import.meta.env.VITE_ENCRYPTION_KEY;
    if (!keyStr) {
        throw new Error('VITE_ENCRYPTION_KEY is not set');
    }
    if (keyStr.length !== 32) {
        throw new Error('VITE_ENCRYPTION_KEY must be exactly 32 characters');
    }

    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyStr);

    // Import as AES key
    return await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

// Encrypts text using AES-256-GCM (more secure for API keys)
export async function encryptGcm(plaintext: string): Promise<string> {
    const key = await getKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    // Convert to base64 strings
    const ivB64 = btoa(String.fromCharCode(...iv));
    const encryptedB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));

    return `${ivB64}:${encryptedB64}`;
}

// Decrypts a base64(iv:encrypted) produced by encryptGcm()
export async function decryptGcm(token: string): Promise<string> {
    const key = await getKey();

    const [ivB64, encryptedB64] = token.split(':');

    // Convert from base64
    const iv = new Uint8Array(atob(ivB64).split('').map(c => c.charCodeAt(0)));
    const encrypted = new Uint8Array(atob(encryptedB64).split('').map(c => c.charCodeAt(0)));

    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
    );

    // Convert back to string
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
}

// Simple synchronous encryption for backward compatibility (less secure)
export function encrypt(text: string): string {
    return btoa(unescape(encodeURIComponent(text)));
}

// Simple synchronous decryption for backward compatibility
export function decrypt(encryptedText: string): string {
    return decodeURIComponent(escape(atob(encryptedText)));
}
