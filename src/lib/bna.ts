/**
 * Serviço de taxas de câmbio BNA (Banco Nacional de Angola)
 * - Tenta buscar via Edge Function do Supabase
 * - Fallback 1: último valor em localStorage
 * - Fallback 2: valores hardcoded conservadores
 */

export interface BnaRates {
  USD: number;
  EUR: number;
  updatedAt: string;
  source: 'live' | 'cached' | 'fallback';
}

// Valores de fallback conservadores (actualizados manualmente)
const FALLBACK_RATES: BnaRates = {
  USD: 830,
  EUR: 910,
  updatedAt: new Date().toISOString(),
  source: 'fallback',
};

const CACHE_KEY    = 'zuca_bna_rates';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

function loadCache(): BnaRates | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: BnaRates & { cachedAt: number } = JSON.parse(raw);
    if (Date.now() - data.cachedAt < CACHE_TTL_MS) {
      return { ...data, source: 'cached' };
    }
    return null;
  } catch {
    return null;
  }
}

function saveCache(rates: BnaRates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...rates, cachedAt: Date.now() }));
  } catch { /* quota exceeded — ignora */ }
}

export function getLastKnownRates(): BnaRates {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return FALLBACK_RATES;
    const data: BnaRates = JSON.parse(raw);
    return { ...data, source: 'cached' };
  } catch {
    return FALLBACK_RATES;
  }
}

export async function fetchBnaRates(): Promise<BnaRates> {
  // 1. Tenta cache válido
  const cached = loadCache();
  if (cached) return cached;

  // 2. Tenta Edge Function Supabase
  const fnUrl = import.meta.env.VITE_BNA_FUNCTION_URL;
  if (fnUrl && !fnUrl.includes('your-project')) {
    try {
      const res = await fetch(fnUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        const rates: BnaRates = {
          USD: Number(data.USD) || FALLBACK_RATES.USD,
          EUR: Number(data.EUR) || FALLBACK_RATES.EUR,
          updatedAt: data.updatedAt || new Date().toISOString(),
          source: 'live',
        };
        saveCache(rates);
        return rates;
      }
    } catch { /* timeout ou erro de rede */ }
  }

  // 3. Fallback para último valor conhecido
  return getLastKnownRates();
}

export function formatCurrency(value: number, currency: 'AOA' | 'USD' | 'EUR'): string {
  const symbols = { AOA: 'Kz', USD: '$', EUR: '€' };
  const locales  = { AOA: 'pt-AO', USD: 'en-US', EUR: 'de-DE' };
  return `${symbols[currency]} ${value.toLocaleString(locales[currency], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function convertToAOA(value: number, currency: 'AOA' | 'USD' | 'EUR', rates: BnaRates): number {
  if (currency === 'AOA') return value;
  return value * (currency === 'USD' ? rates.USD : rates.EUR);
}
