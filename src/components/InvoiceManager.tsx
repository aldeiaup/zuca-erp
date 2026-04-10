import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store';
import { getLastKnownRates } from '../lib/bna';
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  FileText, CheckCircle, Clock, XCircle, TrendingUp,
  Download, Search, Filter
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  paga:      { label: 'Paga',      color: '#00e676', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: CheckCircle },
  emitida:   { label: 'Emitida',   color: '#ffab00', bg: 'bg-amber-500/10',   text: 'text-amber-400',   icon: Clock },
  rascunho:  { label: 'Rascunho',  color: '#888',    bg: 'bg-gray-500/10',    text: 'text-gray-400',    icon: FileText },
  cancelada: { label: 'Cancelada', color: '#ff5252', bg: 'bg-red-500/10',     text: 'text-red-400',     icon: XCircle },
};

function exportCSV(rows: any[]) {
  const headers = ['Número', 'Cliente', 'Data', 'Subtotal', 'IVA', 'Total', 'Status', 'Moeda'];
  const lines = [
    headers.join(';'),
    ...rows.map(r => [
      r.numero, r.clienteNome, r.dataEmissao, r.subtotal, r.iva, r.total, r.status, 'AOA'
    ].join(';')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `faturas_${format(new Date(), 'yyyyMMdd')}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

export default function InvoiceManager() {
  const { faturas, clientes, updateFatura, taxasCambio } = useStore();
  const rates = { ...getLastKnownRates(), ...taxasCambio };

  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'month' | '3m' | 'all'>('all');

  const getCliente = (id: string) => clientes.find(c => c.id === id)?.nome || '—';

  const periodRange = useMemo(() => {
    if (filterPeriod === 'month') return { start: startOfMonth(new Date()), end: endOfMonth(new Date()) };
    if (filterPeriod === '3m')    return { start: startOfMonth(subMonths(new Date(), 2)), end: endOfMonth(new Date()) };
    return null;
  }, [filterPeriod]);

  const filtered = useMemo(() => {
    return faturas.filter(f => {
      const nome = getCliente(f.clienteId).toLowerCase();
      const matchSearch = f.numero.toLowerCase().includes(search.toLowerCase()) || nome.includes(search.toLowerCase());
      const matchStatus = filterStatus === 'all' || f.status === filterStatus;
      const matchPeriod = !periodRange || isWithinInterval(new Date(f.dataEmissao), periodRange);
      return matchSearch && matchStatus && matchPeriod;
    }).sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime());
  }, [faturas, search, filterStatus, periodRange]);

  // Dados para o gráfico de doughnut
  const pieData = useMemo(() => {
    const counts: Record<string, { count: number; total: number }> = {};
    faturas.forEach(f => {
      if (!counts[f.status]) counts[f.status] = { count: 0, total: 0 };
      counts[f.status].count++;
      counts[f.status].total += f.total;
    });
    return Object.entries(counts).map(([status, { count, total }]) => ({
      name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
      value: count,
      total,
      color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || '#888',
    }));
  }, [faturas]);

  const kpis = useMemo(() => ({
    totalEmitido: faturas.filter(f => f.status === 'emitida').reduce((a, f) => a + f.total, 0),
    totalPago:    faturas.filter(f => f.status === 'paga').reduce((a, f) => a + f.total, 0),
    totalCancelado: faturas.filter(f => f.status === 'cancelada').reduce((a, f) => a + f.total, 0),
  }), [faturas]);

  const handleMarcarPaga = (id: string) => {
    updateFatura(id, { status: 'paga' });
    toast.success('Fatura marcada como paga!');
  };

  const handleExport = () => {
    const rows = filtered.map(f => ({ ...f, clienteNome: getCliente(f.clienteId), dataEmissao: format(new Date(f.dataEmissao), 'dd/MM/yyyy') }));
    exportCSV(rows);
    toast.success(`${rows.length} faturas exportadas`);
  };

  const fmtK = (v: number) => v >= 1_000_000 ? `Kz ${(v / 1_000_000).toFixed(2)}M` : `Kz ${(v / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      {/* Grid assimétrico — gráfico + KPIs */}
      <div className="grid grid-cols-12 gap-5">

        {/* Doughnut */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-white font-bold mb-1">Distribuição</h3>
          <p className="text-xs text-gray-500 mb-4">Estado das faturas emitidas</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, props: any) => [
                  `${value} faturas · ${fmtK(props.payload.total)}`, name
                ]}
                contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 12, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* KPIs */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'A Receber', value: fmtK(kpis.totalEmitido), color: '#ffab00', icon: Clock, sub: `${faturas.filter(f => f.status === 'emitida').length} faturas` },
            { label: 'Recebido',  value: fmtK(kpis.totalPago),    color: '#00e676', icon: CheckCircle, sub: `${faturas.filter(f => f.status === 'paga').length} faturas` },
            { label: 'Cancelado', value: fmtK(kpis.totalCancelado), color: '#ff5252', icon: XCircle, sub: `${faturas.filter(f => f.status === 'cancelada').length} faturas` },
          ].map(k => (
            <div key={k.label} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <k.icon className="w-4 h-4" style={{ color: k.color }} />
                <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">{k.label}</span>
              </div>
              <p className="text-xl font-bold text-white font-mono">{k.value}</p>
              <p className="text-xs text-gray-500 mt-1">{k.sub}</p>
            </div>
          ))}

          {/* Conversão BNA rápida */}
          <div className="sm:col-span-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Total em divisa (câmbio BNA)</span>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] text-gray-500">Total recebido em USD</p>
                <p className="text-sm font-bold text-white font-mono">
                  $ {(kpis.totalPago / rates.USD).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Total recebido em EUR</p>
                <p className="text-sm font-bold text-white font-mono">
                  € {(kpis.totalPago / rates.EUR).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">A receber em USD</p>
                <p className="text-sm font-bold text-amber-400 font-mono">
                  $ {(kpis.totalEmitido / rates.USD).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros + tabela */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-white/10 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Pesquisar nº, cliente…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-sm outline-none focus:ring-1 focus:ring-gold-500" />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            {Object.entries({ all: 'Todos', emitida: 'Emitidas', paga: 'Pagas', cancelada: 'Canceladas' }).map(([k, v]) => (
              <button key={k} onClick={() => setFilterStatus(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  filterStatus === k
                    ? 'bg-gold-500/20 text-gold-400 border-gold-500/30'
                    : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600'
                }`}>{v}</button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {[['month', 'Este mês'], ['3m', '3 meses'], ['all', 'Todos']] .map(([k, v]) => (
              <button key={k} onClick={() => setFilterPeriod(k as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  filterPeriod === k
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600'
                }`}>{v}</button>
            ))}
          </div>

          <button onClick={handleExport}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-bold transition-colors border border-gray-600">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Número', 'Cliente', 'Emissão', 'Subtotal', 'IVA', 'Total', 'Estado', 'Acção'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-600">Nenhuma fatura encontrada</td></tr>
              )}
              {filtered.map(f => {
                const sc = STATUS_CONFIG[f.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.rascunho;
                const StatusIcon = sc.icon;
                return (
                  <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-white font-bold">{f.numero}</td>
                    <td className="px-5 py-3 text-gray-300 text-xs">{getCliente(f.clienteId)}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs font-mono">
                      {format(new Date(f.dataEmissao), 'dd/MM/yy', { locale: pt })}
                    </td>
                    <td className="px-5 py-3 text-gray-300 text-xs font-mono tabular-nums">
                      Kz {f.subtotal.toLocaleString('pt-AO')}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs font-mono tabular-nums">
                      Kz {f.iva.toLocaleString('pt-AO')}
                    </td>
                    <td className="px-5 py-3 text-white font-bold text-xs font-mono tabular-nums">
                      Kz {f.total.toLocaleString('pt-AO')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                        <StatusIcon className="w-3 h-3" />{sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {f.status === 'emitida' && (
                        <button onClick={() => handleMarcarPaga(f.id)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-colors">
                          Marcar Paga
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex justify-between items-center">
          <p className="text-xs text-gray-500">{filtered.length} registos</p>
          <p className="text-xs text-gray-400">
            Total filtrado: <span className="text-white font-bold font-mono">
              Kz {filtered.reduce((a, f) => a + f.total, 0).toLocaleString('pt-AO')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
