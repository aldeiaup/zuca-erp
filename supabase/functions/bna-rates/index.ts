/**
 * Supabase Edge Function: bna-rates
 * Busca cotações oficiais do BNA e serve com cache de 1 hora.
 *
 * Deploy: supabase functions deploy bna-rates
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valores de fallback conservadores
const FALLBACK = { USD: 830, EUR: 910 };

// BNA publica cotações nesta página (HTML scraping simples)
const BNA_URL = 'https://www.bna.ao/Conteudos/Artigos/detalhe_artigo.aspx?idc=93&idsc=629&idl=1';

async function scrapeBnaRates(): Promise<{ USD: number; EUR: number } | null> {
  try {
    const res = await fetch(BNA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZucaMotors/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    // Extrai taxas via regex nas tabelas HTML do BNA
    const usdMatch = html.match(/USD[^<]*<[^>]+>[^<]*<[^>]+>\s*([\d,.]+)/i);
    const eurMatch = html.match(/EUR[^<]*<[^>]+>[^<]*<[^>]+>\s*([\d,.]+)/i);

    const usd = usdMatch ? parseFloat(usdMatch[1].replace(',', '.')) : null;
    const eur = eurMatch ? parseFloat(eurMatch[1].replace(',', '.')) : null;

    if (!usd || !eur || usd < 100 || eur < 100) return null; // sanity check
    return { USD: usd, EUR: eur };
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verifica cache na tabela exchange_rates (última hora)
    const { data: cached } = await supabase
      .from('exchange_rates')
      .select('currency, rate_to_aoa, fetched_at')
      .gte('fetched_at', new Date(Date.now() - 3600000).toISOString())
      .in('currency', ['USD', 'EUR'])
      .order('fetched_at', { ascending: false });

    if (cached && cached.length >= 2) {
      const rates = cached.reduce((acc: Record<string, number>, r: any) => {
        acc[r.currency] = r.rate_to_aoa;
        return acc;
      }, {} as Record<string, number>);

      return new Response(JSON.stringify({
        USD: rates.USD,
        EUR: rates.EUR,
        updatedAt: cached[0].fetched_at,
        source: 'cached',
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Tenta scraping BNA
    const live = await scrapeBnaRates();
    const rates = live || FALLBACK;
    const source = live ? 'live' : 'fallback';
    const now = new Date().toISOString();

    // Persiste no banco apenas se conseguiu dados ao vivo
    if (live) {
      await supabase.from('exchange_rates').insert([
        { currency: 'USD', rate_to_aoa: live.USD, fetched_at: now, source: 'bna' },
        { currency: 'EUR', rate_to_aoa: live.EUR, fetched_at: now, source: 'bna' },
      ]);
    }

    return new Response(JSON.stringify({
      USD: rates.USD,
      EUR: rates.EUR,
      updatedAt: now,
      source,
    }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    // Fallback final — nunca retorna erro 500 ao frontend
    return new Response(JSON.stringify({
      ...FALLBACK,
      updatedAt: new Date().toISOString(),
      source: 'fallback',
      error: String(err),
    }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
