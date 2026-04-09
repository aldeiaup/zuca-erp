import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Users, DollarSign, TrendingUp, AlertCircle, Plus,
  CheckCircle, Clock, X, Save
} from 'lucide-react';

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="text-gray-400 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-bold font-mono">Kz {Number(p.value).toLocaleString('pt-AO')}</span>
        </div>
      ))}
    </div>
  );
};

export default function PayrollDashboard() {
  const {
    funcionarios, folhasPagamento, adiantamentos,
    caixasContas, processarFolha, pagarFolha, addAdiantamento,
  } = useStore();

  const anoAtual = new Date().getFullYear();
  const mesAtual = new Date().getMonth() + 1;

  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advForm, setAdvForm] = useState({ funcionarioId: '', valor: '', motivo: '' });

  // Dados para gráfico — últimos 6 meses
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      let mes = mesAtual - 5 + i;
      let ano = anoAtual;
      if (mes <= 0) { mes += 12; ano -= 1; }

      const folhas = folhasPagamento.filter(f => f.mes === mes && f.ano === ano);
      const bruto   = folhas.reduce((a, f) => a + f.salarioBase + f.subsidios + f.premios, 0);
      const irt     = folhas.reduce((a, f) => a + f.irt, 0);
      const inss    = folhas.reduce((a, f) => a + f.inss, 0);
      const liquido = folhas.reduce((a, f) => a + f.totalLiquido, 0);

      return { label: MESES[mes - 1], 'Bruto': bruto, 'IRT': irt, 'INSS': inss, 'Líquido': liquido };
    });
  }, [folhasPagamento, mesAtual, anoAtual]);

  // Folha do mês actual
  const folhaMes = folhasPagamento.filter(f => f.mes === mesAtual && f.ano === anoAtual);
  const totalBrutoMes   = folhaMes.reduce((a, f) => a + f.salarioBase + f.subsidios + f.premios, 0);
  const totalLiquidoMes = folhaMes.reduce((a, f) => a + f.totalLiquido, 0);
  const totalIrtMes     = folhaMes.reduce((a, f) => a + f.irt, 0);
  const totalInssMes    = folhaMes.reduce((a, f) => a + f.inss, 0);

  const adiantamentosPendentes = adiantamentos.filter(a => a.status === 'pendente');
  const totalAdiantamentos     = adiantamentosPendentes.reduce((a, ad) => a + ad.valor, 0);

  const handleProcessarFolha = () => {
    const jaProcessada = folhasPagamento.some(f => f.mes === mesAtual && f.ano === anoAtual);
    if (jaProcessada) {
      toast.error('Folha deste mês já foi processada');
      return;
    }
    processarFolha(mesAtual, anoAtual);
    toast.success(`Folha de ${MESES[mesAtual - 1]}/${anoAtual} processada!`);
  };

  const handlePagarFolha = (id: string) => {
    const conta = caixasContas.find(c => c.aberto);
    if (!conta) { toast.error('Nenhuma caixa aberta. Abra uma caixa antes de pagar.'); return; }
    pagarFolha(id, conta.id);
    toast.success('Pagamento registado!');
  };

  const handleAddAdiantamento = () => {
    if (!advForm.funcionarioId || !advForm.valor) return;
    addAdiantamento({
      funcionarioId: advForm.funcionarioId,
      valor: Number(advForm.valor),
      data: new Date(),
      status: 'pendente',
      motivo: advForm.motivo,
    });
    toast.success('Adiantamento registado!');
    setAdvForm({ funcionarioId: '', valor: '', motivo: '' });
    setShowAdvanceModal(false);
  };

  const getFuncionarioNome = (id: string) => funcionarios.find(f => f.id === id)?.nome || '—';
  const fmtK = (v: number) => `Kz ${(v / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      {/* KPIs do mês */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-blue-400" /><span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Funcionários Activos</span></div>
          <p className="text-3xl font-bold text-white">{funcionarios.filter(f => f.ativo).length}</p>
          <p className="text-xs text-gray-500 mt-1">de {funcionarios.length} registados</p>
        </div>
        <div className="col-span-12 lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <div className="flex items-center gap-2 mb-3"><DollarSign className="w-4 h-4 text-gold-400" /><span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Massa Salarial Bruta</span></div>
          <p className="text-2xl font-bold text-white font-mono">{fmtK(totalBrutoMes)}</p>
          <p className="text-xs text-gray-500 mt-1">{MESES[mesAtual - 1]}/{anoAtual}</p>
        </div>
        <div className="col-span-12 lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-emerald-400" /><span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Total Líquido a Pagar</span></div>
          <p className="text-2xl font-bold text-white font-mono">{fmtK(totalLiquidoMes)}</p>
          <p className="text-xs text-gray-500 mt-1">IRT: {fmtK(totalIrtMes)} · INSS: {fmtK(totalInssMes)}</p>
        </div>
        <div className="col-span-12 lg:col-span-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md p-5">
          <div className="flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4 text-amber-400" /><span className="text-xs text-amber-400 uppercase tracking-widest font-bold">Adiantamentos Pendentes</span></div>
          <p className="text-2xl font-bold text-white font-mono">{fmtK(totalAdiantamentos)}</p>
          <p className="text-xs text-gray-500 mt-1">{adiantamentosPendentes.length} pendentes</p>
        </div>
      </div>

      {/* Acções */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={handleProcessarFolha}
          className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Processar Folha {MESES[mesAtual - 1]}/{anoAtual}
        </button>
        <button onClick={() => setShowAdvanceModal(true)}
          className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Adiantamento
        </button>
      </div>

      {/* Grid — gráfico + folhas */}
      <div className="grid grid-cols-12 gap-5">
        {/* Gráfico evolução custos salariais */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-white font-bold mb-1">Evolução de Custos Salariais</h3>
          <p className="text-xs text-gray-500 mb-5">Últimos 6 meses · Bruto vs Líquido vs Encargos</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
              <XAxis dataKey="label" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#888' }} />
              <Bar dataKey="Bruto"   fill="#d4a01240" stroke="#d4a012" strokeWidth={1} radius={[4,4,0,0]} />
              <Bar dataKey="Líquido" fill="#00e67640" stroke="#00e676" strokeWidth={1} radius={[4,4,0,0]} />
              <Bar dataKey="IRT"     fill="#ff525240" stroke="#ff5252" strokeWidth={1} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Adiantamentos pendentes */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6">
          <h3 className="text-white font-bold mb-4">Adiantamentos Pendentes</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {adiantamentosPendentes.length === 0 && (
              <p className="text-gray-500 text-sm">Sem adiantamentos pendentes</p>
            )}
            {adiantamentosPendentes.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <div>
                  <p className="text-white text-xs font-bold">{getFuncionarioNome(a.funcionarioId)}</p>
                  <p className="text-gray-500 text-[10px]">{a.motivo || 'Sem motivo'}</p>
                </div>
                <p className="text-amber-400 font-bold text-sm font-mono">Kz {a.valor.toLocaleString('pt-AO')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Folhas do mês */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-white font-bold">Folhas de Pagamento — {MESES[mesAtual - 1]}/{anoAtual}</h3>
          <span className="text-xs text-gray-500">{folhaMes.length} funcionários</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Funcionário', 'Bruto', 'INSS', 'IRT', 'Adiant.', 'Líquido', 'Estado', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {folhaMes.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-600">
                    Folha não processada. Clique em "Processar Folha" acima.
                  </td>
                </tr>
              )}
              {folhaMes.map(f => (
                <tr key={f.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3 text-white font-medium text-xs">{getFuncionarioNome(f.funcionarioId)}</td>
                  <td className="px-5 py-3 text-gray-300 font-mono text-xs tabular-nums">
                    Kz {(f.salarioBase + f.subsidios + f.premios).toLocaleString('pt-AO')}
                  </td>
                  <td className="px-5 py-3 text-red-400 font-mono text-xs tabular-nums">-Kz {f.inss.toLocaleString('pt-AO')}</td>
                  <td className="px-5 py-3 text-red-400 font-mono text-xs tabular-nums">-Kz {f.irt.toLocaleString('pt-AO')}</td>
                  <td className="px-5 py-3 text-amber-400 font-mono text-xs tabular-nums">-Kz {f.adiantamentos.toLocaleString('pt-AO')}</td>
                  <td className="px-5 py-3 text-white font-bold font-mono text-xs tabular-nums">
                    Kz {f.totalLiquido.toLocaleString('pt-AO')}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      f.status === 'pago'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {f.status === 'pago' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {f.status === 'pago' ? 'Pago' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {f.status === 'pendente' && (
                      <button onClick={() => handlePagarFolha(f.id)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-colors">
                        Pagar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adiantamento */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md p-7 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">Novo Adiantamento</h3>
              <button onClick={() => setShowAdvanceModal(false)} className="p-2 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Funcionário *</label>
                <select value={advForm.funcionarioId}
                  onChange={e => setAdvForm(f => ({ ...f, funcionarioId: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-gold-500">
                  <option value="">Seleccionar…</option>
                  {funcionarios.filter(f => f.ativo).map(f => (
                    <option key={f.id} value={f.id}>{f.nome} — {f.cargo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Valor (Kz) *</label>
                <input type="number" min="0" placeholder="Ex: 50000"
                  value={advForm.valor}
                  onChange={e => setAdvForm(f => ({ ...f, valor: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 font-mono" />
                {advForm.funcionarioId && advForm.valor && (
                  <p className="text-xs text-amber-400 mt-1">
                    Será descontado na próxima folha de pagamento
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Motivo</label>
                <textarea value={advForm.motivo}
                  onChange={e => setAdvForm(f => ({ ...f, motivo: e.target.value }))}
                  placeholder="Motivo do adiantamento (opcional)…"
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 resize-none" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowAdvanceModal(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors">
                Cancelar
              </button>
              <button onClick={handleAddAdiantamento}
                disabled={!advForm.funcionarioId || !advForm.valor}
                className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
                <Save className="w-4 h-4" /> Registar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
