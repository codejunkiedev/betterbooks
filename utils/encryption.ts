import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

function getKey(): Buffer {
	const keyStr = process.env.ENCRYPTION_KEY;
	if (!keyStr) {
		throw new Error('ENCRYPTION_KEY is not set');
	}
	const key = Buffer.from(keyStr, 'utf8');
	if (key.length !== 32) {
		throw new Error('ENCRYPTION_KEY must be exactly 32 bytes');
	}
	return key;
}

// Encrypts text using AES-256-CBC. Returns base64(iv + ciphertext)
export function encrypt(text: string): string {
	const iv = randomBytes(16);
	const cipher = createCipheriv('aes-256-cbc', getKey(), iv);
	const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
	return Buffer.concat([iv, encrypted]).toString('base64');
}

// Decrypts a base64(iv + ciphertext) produced by encrypt()
export function decrypt(encryptedText: string): string {
	const data = Buffer.from(encryptedText, 'base64');
	if (data.length < 17) {
		throw new Error('Invalid encrypted payload');
	}
	const iv = data.subarray(0, 16);
	const ciphertext = data.subarray(16);
	const decipher = createDecipheriv('aes-256-cbc', getKey(), iv);
	const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
	return decrypted.toString('utf8');
} 