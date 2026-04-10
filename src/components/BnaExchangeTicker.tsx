import { useState, useEffect, useCallback } from 'react';
import { fetchBnaRates, getLastKnownRates } from '../lib/bna';
import type { BnaRates } from '../lib/bna';
import { TrendingUp, Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { useStore } from '../store';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

const sourceConfig = {
  live:     { label: 'BNA Ao Vivo',  dot: 'bg-emerald-400', text: 'text-emerald-400', pulse: true },
  cached:   { label: 'Cache BNA',    dot: 'bg-amber-400',   text: 'text-amber-400',   pulse: false },
  fallback: { label: 'Último valor', dot: 'bg-red-400',      text: 'text-red-400',     pulse: false },
};

function RateCard({ currency, rate, prev }: { currency: string; rate: number; prev: number }) {
  const changed = rate !== prev;
  const up      = rate > prev;

  return (
    <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
      <span className="text-[11px] font-bold text-gray-400 tracking-widest">{currency}</span>
      <span
        className={`font-mono text-sm font-bold tabular-nums transition-all duration-500 ${
          changed ? (up ? 'text-emerald-400' : 'text-red-400') : 'text-white'
        }`}
      >
        {rate.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
      </span>
      <span className="text-[10px] text-gray-500 font-medium">AOA</span>
      {changed && (
        <span className={`text-[9px] font-bold ${up ? 'text-emerald-400' : 'text-red-400'}`}>
          {up ? '▲' : '▼'}
        </span>
      )}
    </div>
  );
}

export default function BnaExchangeTicker() {
  const { updateTaxas } = useStore();
  const [rates, setRates]     = useState<BnaRates>(getLastKnownRates());
  const [prev, setPrev]       = useState<{ USD: number; EUR: number }>({ USD: rates.USD, EUR: rates.EUR });
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());

  const refresh = useCallback(async (manual = false) => {
    if (manual) setLoading(true);
    try {
      const currentRates = rates;
      const data = await fetchBnaRates();
      setPrev({ USD: currentRates.USD, EUR: currentRates.EUR });
      setRates(data);
      setLastFetch(new Date());
      updateTaxas({ USD: data.USD, EUR: data.EUR });
    } finally {
      if (manual) setLoading(false);
    }
  }, [updateTaxas]);

  // Polling automático
  useEffect(() => {
    refresh();
    const interval = setInterval(() => refresh(), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  const src = sourceConfig[rates.source];
  const timeStr = lastFetch.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full bg-gray-900/80 border-b border-gray-700/60 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-2 gap-4">
        {/* Logo/Label */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="p-1 bg-gold-500/10 rounded-lg border border-gold-500/20">
            <TrendingUp className="w-3.5 h-3.5 text-gold-400" />
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
            BNA Câmbio
          </span>
        </div>

        {/* Ticker cards */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <RateCard currency="USD" rate={rates.USD} prev={prev.USD} />
          <div className="w-px h-5 bg-gray-700" />
          <RateCard currency="EUR" rate={rates.EUR} prev={prev.EUR} />
        </div>

        {/* Status + refresh */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 hidden md:flex">
            <div className="relative flex">
              <span className={`w-1.5 h-1.5 rounded-full ${src.dot}`} />
              {src.pulse && (
                <span className={`absolute inset-0 w-1.5 h-1.5 rounded-full ${src.dot} animate-ping opacity-75`} />
              )}
            </div>
            <span className={`text-[10px] font-bold ${src.text}`}>{src.label}</span>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-gray-600 hidden lg:flex">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-mono">{timeStr}</span>
          </div>

          {/* Botão refresh manual */}
          <button
            onClick={() => refresh(true)}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 transition-all disabled:opacity-40"
            title="Actualizar cotações"
          >
            {rates.source === 'fallback'
              ? <WifiOff className="w-3.5 h-3.5 text-red-400" />
              : <Wifi className={`w-3.5 h-3.5 ${rates.source === 'live' ? 'text-emerald-400' : 'text-amber-400'}`} />
            }
          </button>
          <button
            onClick={() => refresh(true)}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold-400' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
