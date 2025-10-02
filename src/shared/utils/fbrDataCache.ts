import type { HSCodeSearchResult, UOMCode } from '@/shared/types/invoice';

interface Cache<T> {
  data: T[];
  timestamp: number;
  expiresAt: number;
}

const HS_CODE_CACHE_KEY = 'betterbooks_hs_codes_cache';
const UOM_CODE_CACHE_KEY = 'betterbooks_uom_codes_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Generic cache functions
function saveToCache<T>(cacheKey: string, data: T[]): void {
  try {
    if (!data || data.length === 0) {
      return;
    }
    
    const now = Date.now();
    const cache: Cache<T> = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (error) {
    console.warn(`Failed to save to cache (${cacheKey}):`, error);
  }
}

function getFromCache<T>(cacheKey: string): T[] | null {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return null;
    }

    const cache: Cache<T> = JSON.parse(cached);
    const now = Date.now();

    if (!cache.data || !Array.isArray(cache.data) || !cache.expiresAt || !cache.timestamp) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    if (now > cache.expiresAt) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return cache.data;
  } catch (error) {
    console.warn(`Failed to retrieve from cache (${cacheKey}):`, error);
    localStorage.removeItem(cacheKey);
    return null;
  }
}

function clearCache(cacheKey: string): void {
  try {
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn(`Failed to clear cache (${cacheKey}):`, error);
  }
}

function isCacheValid(cacheKey: string): boolean {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return false;
    }

    const cache: Cache<unknown> = JSON.parse(cached);
    const now = Date.now();

    if (!cache.data || !Array.isArray(cache.data) || !cache.expiresAt || !cache.timestamp) {
      return false;
    }

    return now <= cache.expiresAt;
  } catch (error) {
    console.warn(`Failed to check cache validity (${cacheKey}):`, error);
    return false;
  }
}

function getCacheInfo(cacheKey: string): { 
  exists: boolean; 
  valid: boolean; 
  timestamp?: number; 
  expiresAt?: number; 
  itemCount?: number;
} {
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return { exists: false, valid: false };
    }

    const cache: Cache<unknown> = JSON.parse(cached);
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
    console.warn(`Failed to get cache info (${cacheKey}):`, error);
    return { exists: false, valid: false };
  }
}

// HSCode specific functions
export function saveHSCodesToCache(hsCodes: HSCodeSearchResult[]): void {
  saveToCache(HS_CODE_CACHE_KEY, hsCodes);
}

export function getHSCodesFromCache(): HSCodeSearchResult[] | null {
  return getFromCache<HSCodeSearchResult>(HS_CODE_CACHE_KEY);
}

export function clearHSCodeCache(): void {
  clearCache(HS_CODE_CACHE_KEY);
}

export function isHSCodeCacheValid(): boolean {
  return isCacheValid(HS_CODE_CACHE_KEY);
}

export function getHSCodeCacheInfo(): { 
  exists: boolean; 
  valid: boolean; 
  timestamp?: number; 
  expiresAt?: number; 
  itemCount?: number;
} {
  return getCacheInfo(HS_CODE_CACHE_KEY);
}

// UOM Code specific functions
export function saveUOMCodesToCache(uomCodes: UOMCode[]): void {
  saveToCache(UOM_CODE_CACHE_KEY, uomCodes);
}

export function getUOMCodesFromCache(): UOMCode[] | null {
  return getFromCache<UOMCode>(UOM_CODE_CACHE_KEY);
}

export function clearUOMCodeCache(): void {
  clearCache(UOM_CODE_CACHE_KEY);
}

export function isUOMCodeCacheValid(): boolean {
  return isCacheValid(UOM_CODE_CACHE_KEY);
}

export function getUOMCodeCacheInfo(): { 
  exists: boolean; 
  valid: boolean; 
  timestamp?: number; 
  expiresAt?: number; 
  itemCount?: number;
} {
  return getCacheInfo(UOM_CODE_CACHE_KEY);
}