import type { HSCodeSearchResult } from '@/shared/types/invoice';

interface HSCodeCache {
  data: HSCodeSearchResult[];
  timestamp: number;
  expiresAt: number;
}

const HS_CODE_CACHE_KEY = 'betterbooks_hs_codes_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function saveHSCodesToCache(hsCodes: HSCodeSearchResult[]): void {
  try {
    if (!hsCodes || hsCodes.length === 0) {
      return;
    }
    
    const now = Date.now();
    const cache: HSCodeCache = {
      data: hsCodes,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };
    
    localStorage.setItem(HS_CODE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to save HS codes to cache:', error);
  }
}

export function getHSCodesFromCache(): HSCodeSearchResult[] | null {
  try {
    const cached = localStorage.getItem(HS_CODE_CACHE_KEY);
    if (!cached) {
      return null;
    }

    const cache: HSCodeCache = JSON.parse(cached);
    const now = Date.now();

    if (!cache.data || !Array.isArray(cache.data) || !cache.expiresAt || !cache.timestamp) {
      localStorage.removeItem(HS_CODE_CACHE_KEY);
      return null;
    }

    if (now > cache.expiresAt) {
      localStorage.removeItem(HS_CODE_CACHE_KEY);
      return null;
    }

    return cache.data;
  } catch (error) {
    console.warn('Failed to retrieve HS codes from cache:', error);
    localStorage.removeItem(HS_CODE_CACHE_KEY);
    return null;
  }
}

export function clearHSCodeCache(): void {
  try {
    localStorage.removeItem(HS_CODE_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear HS codes cache:', error);
  }
}

export function isHSCodeCacheValid(): boolean {
  try {
    const cached = localStorage.getItem(HS_CODE_CACHE_KEY);
    if (!cached) {
      return false;
    }

    const cache: HSCodeCache = JSON.parse(cached);
    const now = Date.now();

    if (!cache.data || !Array.isArray(cache.data) || !cache.expiresAt || !cache.timestamp) {
      return false;
    }

    return now <= cache.expiresAt;
  } catch (error) {
    console.warn('Failed to check HS codes cache validity:', error);
    return false;
  }
}

export function getHSCodeCacheInfo(): { 
  exists: boolean; 
  valid: boolean; 
  timestamp?: number; 
  expiresAt?: number; 
  itemCount?: number;
} {
  try {
    const cached = localStorage.getItem(HS_CODE_CACHE_KEY);
    if (!cached) {
      return { exists: false, valid: false };
    }

    const cache: HSCodeCache = JSON.parse(cached);
    const now = Date.now();
    
    if (!cache.data || !Array.isArray(cache.data) || !cache.expiresAt || !cache.timestamp) {
      return { exists: true, valid: false };
    }
    
    const valid = now <= cache.expiresAt;

    return {
      exists: true,
      valid,
      timestamp: cache.timestamp,
      expiresAt: cache.expiresAt,
      itemCount: cache.data.length
    };
  } catch (error) {
    console.warn('Failed to get HS codes cache info:', error);
    return { exists: false, valid: false };
  }
}