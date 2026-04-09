import { useMemo, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useStore } from '../store';
import { getLastKnownRates, convertToAOA, formatCurrency } from '../lib/bna';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  TrendingUp, TrendingDown, DollarSign, Building2,
  ArrowUpRight, ArrowDownRight, Wallet
} from 'lucide-react';

const MONTHS = 6;

function KpiCard({
  label, value, sub, trend, icon: Icon, accent
}: {
  label: string; value: string; sub?: string;
  trend?: 'up' | 'down' | 'neutral'; icon: any; accent: string;
}) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 flex flex-col gap-3">
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 blur-2xl rounded-full" style={{ background: accent }} />
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl`} style={{ background: `${accent}20` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
        {TrendIcon && <TrendIcon className={`w-4 h-4 ${trendColor}`} />}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">{label}</p>
        <p className="text-xl font-bold text-white font-mono tabular-nums leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-bold font-mono">
            Kz {Number(p.value).toLocaleString('pt-AO')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function CashFlowDashboard() {
  const { transacoes, faturas, caixasContas, taxasCambio } = useStore();
  const rates = { ...getLastKnownRates(), ...taxasCambio };
  const [unidade, setUnidade] = useState<'todas' | 'Benfica' | 'Alvalade'>('todas');

  // Saldos consolidados
  const { totalAOA, totalUSD, totalEUR } = useMemo(() => {
    const contas = unidade === 'todas'
      ? caixasContas
      : caixasContas.filter(c => c.unidade === unidade);
    return {
      totalAOA: contas.reduce((a, c) => a + c.saldoAOA, 0),
      totalUSD: contas.reduce((a, c) => a + c.saldoUSD, 0),
      totalEUR: contas.reduce((a, c) => a + c.saldoEUR, 0),
    };
  }, [caixasContas, unidade]);

  const totalConsolidadoAOA = totalAOA + totalUSD * rates.USD + totalEUR * rates.EUR;

  // Dados mensais para gráfico de área (últimos 6 meses)
  const monthlyData = useMemo(() => {
    return Array.from({ length: MONTHS }, (_, i) => {
      const ref   = subMonths(new Date(), MONTHS - 1 - i);
      const start = startOfMonth(ref);
      const end   = endOfMonth(ref);
      const label = format(ref, 'MMM', { locale: pt });

      const txs = transacoes.filter(t =>
        isWithinInterval(new Date(t.data), { start, end })
      );

      const entradas = txs
        .filter(t => t.tipo === 'entrada')
        .reduce((a, t) => a + convertToAOA(t.valor, t.moeda, rates), 0);

      const saidas = txs
        .filter(t => t.tipo === 'saida')
        .reduce((a, t) => a + convertToAOA(t.valor, t.moeda, rates), 0);

      const receitaFaturas = faturas
        .filter(f => f.status === 'paga' && isWithinInterval(new Date(f.dataEmissao), { start, end }))
        .reduce((a, f) => a + f.total, 0);

      return {
        label,
        Entradas: Math.round(entradas + receitaFaturas),
        Saídas: Math.round(saidas),
        Lucro: Math.round(entradas + receitaFaturas - saidas),
      };
    });
  }, [transacoes, faturas, rates]);

  // Top categorias de despesa
  const topCategorias = useMemo(() => {
    const map: Record<string, number> = {};
    transacoes
      .filter(t => t.tipo === 'saida')
      .forEach(t => {
        const v = convertToAOA(t.valor, t.moeda, rates);
        map[t.categoria] = (map[t.categoria] || 0) + v;
      });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [transacoes, rates]);

  // KPIs do mês actual
  const { entradaMes, saidaMes, lucroMes } = useMemo(() => {
    const start = startOfMonth(new Date());
    const end   = endOfMonth(new Date());
    const txsMes = transacoes.filter(t => isWithinInterval(new Date(t.data), { start, end }));
    const e = txsMes.filter(t => t.tipo === 'entrada').reduce((a, t) => a + convertToAOA(t.valor, t.moeda, rates), 0);
    const s = txsMes.filter(t => t.tipo === 'saida').reduce((a, t) => a + convertToAOA(t.valor, t.moeda, rates), 0);
    const faturadoMes = faturas
      .filter(f => f.status === 'paga' && isWithinInterval(new Date(f.dataEmissao), { start, end }))
      .reduce((a, f) => a + f.total, 0);
    return { entradaMes: e + faturadoMes, saidaMes: s, lucroMes: e + faturadoMes - s };
  }, [transacoes, faturas, rates]);

  const fmtK = (v: number) =>
    v >= 1_000_000
      ? `Kz ${(v / 1_000_000).toFixed(2)}M`
      : `Kz ${(v / 1000).toFixed(0)}K`;

  const COLORS = ['#d4a012', '#00d4ff', '#00e676', '#ff5252', '#ffab00', '#a855f7'];

  return (
    <div className="space-y-6">
      {/* Filtro unidade */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Unidade:</span>
        {(['todas', 'Benfica', 'Alvalade'] as const).map(u => (
          <button key={u} onClick={() => setUnidade(u)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              unidade === u
                ? 'bg-gold-500/20 text-gold-400 border-gold-500/30'
                : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600'
            }`}>
            {u === 'todas' ? 'Todas as Unidades' : u}
          </button>
        ))}
      </div>

      {/* ── Grid Principal Assimétrico ── */}
      <div className="grid grid-cols-12 gap-5">

        {/* KPI — Saldo consolidado (large card) */}
        <div className="col-span-12 lg:col-span-4 relative overflow-hidden rounded-2xl border border-gold-500/20 bg-gradient-to-br from-gold-900/20 to-gray-900 backdrop-blur-md p-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-gold-400" />
              <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Saldo Consolidado</span>
            </div>
            <p className="text-3xl font-bold text-white font-mono tabular-nums mb-1">
              {fmtK(totalConsolidadoAOA)}
            </p>
            <p className="text-xs text-gray-500 mb-5">Valor total em AOA (câmbio BNA)</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'AOA', value: `Kz ${(totalAOA / 1000).toFixed(0)}K`, color: '#d4a012' },
                { label: 'USD', value: `$ ${totalUSD.toLocaleString('en-US')}`, color: '#00d4ff' },
                { label: 'EUR', value: `€ ${totalEUR.toLocaleString('de-DE')}`, color: '#00e676' },
              ].map(c => (
                <div key={c.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: c.color }}>{c.label}</p>
                  <p className="text-sm font-bold text-white font-mono">{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs do mês */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-4">
          <KpiCard label="Entradas (mês)" value={fmtK(entradaMes)} icon={TrendingUp}
            trend="up" accent="#00e676" sub="Faturas pagas + receitas" />
          <KpiCard label="Saídas (mês)" value={fmtK(saidaMes)} icon={TrendingDown}
            trend="down" accent="#ff5252" sub="Despesas e fornecedores" />
          <KpiCard label="Resultado (mês)" value={fmtK(lucroMes)} icon={DollarSign}
            trend={lucroMes >= 0 ? 'up' : 'down'} accent={lucroMes >= 0 ? '#d4a012' : '#ff5252'}
            sub={lucroMes >= 0 ? 'Saldo positivo' : 'Saldo negativo'} />
        </div>

        {/* Gráfico de Área — Fluxo de Caixa */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-bold">Fluxo de Caixa</h3>
              <p className="text-xs text-gray-500">Últimos {MONTHS} meses · valores em AOA</p>
            </div>
            <Building2 className="w-4 h-4 text-gray-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00e676" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00e676" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff5252" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff5252" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#d4a012" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4a012" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
              <Area type="monotone" dataKey="Entradas" stroke="#00e676" fill="url(#gradEntradas)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Saídas"   stroke="#ff5252" fill="url(#gradSaidas)"   strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Lucro"    stroke="#d4a012" fill="url(#gradLucro)"    strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras — Top Despesas por Categoria */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <div className="mb-5">
            <h3 className="text-white font-bold">Top Despesas</h3>
            <p className="text-xs text-gray-500">Por categoria · total acumulado</p>
          </div>
          {topCategorias.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
              Sem dados de despesas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCategorias} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#aaa', fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Despesa" radius={[0, 4, 4, 0]}>
                  {topCategorias.map((_, i) => (
                    <rect key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Caixas e Contas — lista compacta */}
        <div className="col-span-12">
          <h3 className="text-white font-bold mb-3 text-sm">Caixas & Contas Bancárias</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {caixasContas.map(c => {
              const totalAoa = c.saldoAOA + c.saldoUSD * rates.USD + c.saldoEUR * rates.EUR;
              return (
                <div key={c.id}
                  className="rounded-2xl border bg-white/5 backdrop-blur-sm p-5 relative overflow-hidden"
                  style={{ borderColor: c.aberto ? '#d4a01240' : '#2a2a3e' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white truncate">{c.nome}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      c.aberto
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-gray-700/50 text-gray-500 border-gray-600'
                    }`}>{c.aberto ? 'Aberta' : 'Fechada'}</span>
                  </div>
                  <p className="text-lg font-bold text-white font-mono tabular-nums">{fmtK(totalAoa)}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{c.unidade} · {c.tipo === 'banco' ? `Banco ${c.bancoNome}` : 'Caixa Físico'}</p>
                  <div className="flex gap-3 mt-3 text-[10px]">
                    {c.saldoAOA > 0 && <span className="text-gold-400 font-mono">Kz {(c.saldoAOA / 1000).toFixed(0)}K</span>}
                    {c.saldoUSD > 0 && <span className="text-cyan-400 font-mono">$ {c.saldoUSD.toLocaleString()}</span>}
                    {c.saldoEUR > 0 && <span className="text-emerald-400 font-mono">€ {c.saldoEUR.toLocaleString()}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
