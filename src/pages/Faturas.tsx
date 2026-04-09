import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store';
import type { Fatura } from '../store';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { FileText, Download, Eye, Plus, Printer, Send, X, Building2, User, CreditCard, Hash, CheckCircle, Trash2, Save, Edit2 } from 'lucide-react';

type FaturaStatus = 'rascunho' | 'emitida' | 'paga' | 'cancelada';
type MeioPagamento = 'numerario' | 'transferencia' | 'multibanco';

type FaturaForm = {
  clienteId: string;
  subtotal: number;
  ivaRate: number;
  dataEmissao: string;
  dataVencimento: string;
  status: FaturaStatus;
  meioPagamento: MeioPagamento | '';
};

const buildEmptyForm = (taxaIva: number): FaturaForm => ({
  clienteId: '',
  subtotal: 0,
  ivaRate: taxaIva,
  dataEmissao: new Date().toISOString().split('T')[0],
  dataVencimento: '',
  status: 'emitida',
  meioPagamento: '',
});

const getStatusBadge = (status: string) => {
  const badges: Record<string, { bg: string; text: string; label: string }> = {
    paga: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Paga' },
    emitida: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Emitida' },
    cancelada: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelada' },
    rascunho: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Rascunho' },
  };
  return badges[status] || badges.rascunho;
};

export default function Faturas() {
  const { faturas, clientes, addFatura, updateFatura, deleteFatura, config } = useStore();
  const taxaIva = config?.fiscal?.taxaIva ?? 14;
  const serieFatura = config?.fiscal?.serie ?? 'FT';

  const [selectedFatura, setSelectedFatura] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paga' | 'emitida'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FaturaForm>(() => buildEmptyForm(taxaIva));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filtered = filter === 'all' ? faturas : faturas.filter(f => f.status === filter);
  const faturaSelecionada = selectedFatura ? faturas.find(f => f.id === selectedFatura) : null;
  const getCliente = (id: string) => clientes.find(c => c.id === id);

  const totalReceita = faturas.filter(f => f.status === 'paga').reduce((a, f) => a + f.total, 0);
  const totalPendente = faturas.filter(f => f.status === 'emitida').reduce((a, f) => a + f.total, 0);

  const calcTotais = (subtotal: number, ivaRate: number) => {
    const iva = Math.round(subtotal * (ivaRate / 100));
    const total = subtotal + iva;
    return { iva, total };
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(buildEmptyForm(taxaIva));
    setShowModal(true);
  };

  const openEdit = (fatura: Fatura) => {
    const ivaRate = fatura.subtotal > 0 ? Math.round((fatura.iva / fatura.subtotal) * 100) : 14;
    setEditingId(fatura.id);
    setForm({
      clienteId: fatura.clienteId,
      subtotal: fatura.subtotal,
      ivaRate,
      dataEmissao: new Date(fatura.dataEmissao).toISOString().split('T')[0],
      dataVencimento: fatura.dataVencimento ? new Date(fatura.dataVencimento).toISOString().split('T')[0] : '',
      status: fatura.status,
      meioPagamento: fatura.meioPagamento || '',
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.clienteId || form.subtotal <= 0) return;
    const { iva, total } = calcTotais(form.subtotal, form.ivaRate);
    const data = {
      clienteId: form.clienteId,
      subtotal: form.subtotal,
      iva,
      total,
      dataEmissao: new Date(form.dataEmissao),
      dataVencimento: form.dataVencimento ? new Date(form.dataVencimento) : undefined,
      status: form.status,
      meioPagamento: form.meioPagamento as MeioPagamento | undefined,
    };
    if (editingId) {
      updateFatura(editingId, data);
      toast.success('Fatura actualizada!');
    } else {
      addFatura(data);
      toast.success('Fatura criada com sucesso!');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteFatura(id);
    setShowDeleteConfirm(null);
    if (selectedFatura === id) setSelectedFatura(null);
    toast.error('Fatura eliminada');
  };

  const handleMarcarPaga = (id: string) => {
    updateFatura(id, { status: 'paga' });
    toast.success('Fatura marcada como paga!');
  };

  const { iva: previewIva, total: previewTotal } = calcTotais(form.subtotal, form.ivaRate);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Faturas</h1>
          <p className="text-gray-400">Gestão de faturas e documentos fiscais</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova Fatura
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Recebido</p>
          <p className="text-2xl font-bold text-emerald-400">Kz {(totalReceita / 1000).toFixed(1)}K</p>
        </div>
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Por Receber</p>
          <p className="text-2xl font-bold text-amber-400">Kz {(totalPendente / 1000).toFixed(1)}K</p>
        </div>
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Faturas Emitidas</p>
          <p className="text-2xl font-bold text-white">{faturas.filter(f => f.status === 'emitida').length}</p>
        </div>
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total de Faturas</p>
          <p className="text-2xl font-bold text-white">{faturas.length}</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="p-6 border-b border-gray-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Documentos Fiscais</h3>
            <p className="text-sm text-gray-400">Conformidade AGT/NIF Angola</p>
          </div>
          <div className="flex gap-2">
            {(['all', 'paga', 'emitida'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f ? 'bg-gold-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Todas' : f === 'paga' ? 'Pagas' : 'Pendentes'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Número</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">NIF</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Data</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Valor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filtered.map((fatura) => {
                const badge = getStatusBadge(fatura.status);
                const cliente = getCliente(fatura.clienteId);
                return (
                  <tr key={fatura.id} className="hover:bg-gray-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold-500/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gold-400" />
                        </div>
                        <span className="text-white font-mono font-medium">{fatura.numero}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {cliente?.tipo === 'empresa' ? <Building2 className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-blue-400" />}
                        <span className="text-gray-300">{cliente?.nome || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 font-mono text-sm">{cliente?.nif || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{format(new Date(fatura.dataEmissao), 'dd MMM yyyy', { locale: pt })}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gold-400 font-bold">Kz {fatura.total.toLocaleString('pt-AO')}</p>
                        <p className="text-gray-500 text-xs">IVA: Kz {fatura.iva.toLocaleString('pt-AO')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setSelectedFatura(fatura.id)} className="p-2 text-gray-400 hover:text-gold-400 hover:bg-gray-700 rounded-lg transition-colors" title="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(fatura)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Editar">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {fatura.status === 'emitida' && (
                          <button onClick={() => handleMarcarPaga(fatura.id)} className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-gray-700 rounded-lg transition-colors" title="Marcar como Paga">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => setShowDeleteConfirm(fatura.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gold-400 hover:bg-gray-700 rounded-lg transition-colors" title="Imprimir">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gold-400 hover:bg-gray-700 rounded-lg transition-colors" title="Enviar">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">Nenhuma fatura encontrada</p>
            <button onClick={openAdd} className="mt-4 text-gold-400 hover:text-gold-300 text-sm font-medium">
              + Criar fatura
            </button>
          </div>
        )}
      </div>

      {/* Modal Ver Fatura */}
      {faturaSelecionada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{faturaSelecionada.numero}</h3>
                <p className="text-gray-400">Documento Fiscal</p>
              </div>
              <button onClick={() => setSelectedFatura(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Emitente</p>
                  <p className="font-bold text-gray-900">ZUCAMOTORS Angola, Lda</p>
                  <p className="text-gray-600 text-sm">NIF: 00000000000000</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm mb-1">Data de Emissão</p>
                  <p className="font-bold text-gray-900">{format(new Date(faturaSelecionada.dataEmissao), "dd 'de' MMMM 'de' yyyy", { locale: pt })}</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(faturaSelecionada.status).bg} ${getStatusBadge(faturaSelecionada.status).text}`}>
                    {getStatusBadge(faturaSelecionada.status).label}
                  </span>
                </div>
              </div>

              <div className="border-t border-b border-gray-200 py-4">
                <p className="text-gray-500 text-sm mb-1">Cliente</p>
                <p className="font-bold text-gray-900">{getCliente(faturaSelecionada.clienteId)?.nome}</p>
                <p className="text-gray-600 text-sm">NIF: {getCliente(faturaSelecionada.clienteId)?.nif || '-'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-500 text-sm">
                      <th className="text-left">Descrição</th>
                      <th className="text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-900">Serviços de oficina</td>
                      <td className="py-2 text-right text-gray-900">Kz {faturaSelecionada.subtotal.toLocaleString('pt-AO')}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-gray-600">IVA (14%)</td>
                      <td className="py-2 text-right text-gray-600">Kz {faturaSelecionada.iva.toLocaleString('pt-AO')}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-gray-900">TOTAL</td>
                      <td className="py-2 text-right font-bold text-gold-600 text-lg">Kz {faturaSelecionada.total.toLocaleString('pt-AO')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {faturaSelecionada.meioPagamento && (
                <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 text-sm">
                    Pago via {faturaSelecionada.meioPagamento === 'numerario' ? 'Numerário' : faturaSelecionada.meioPagamento === 'transferencia' ? 'Transferência' : 'Multibanco'}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs">Série: A</p>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <Hash className="w-3 h-3" /> Hash: {faturaSelecionada.id.slice(0, 8)}...
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                  <button className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar / Editar Fatura */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Fatura' : 'Nova Fatura'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Cliente *</label>
                <select
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Selecionar cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Subtotal (Kz) *</label>
                <input
                  type="number"
                  value={form.subtotal}
                  onChange={(e) => setForm({ ...form, subtotal: Number(e.target.value) })}
                  min={0}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Taxa IVA (%)</label>
                  <select
                    value={form.ivaRate}
                    onChange={(e) => setForm({ ...form, ivaRate: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value={0}>0% (Isento)</option>
                    <option value={5}>5%</option>
                    <option value={14}>14% (Padrão)</option>
                  </select>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-3 flex flex-col justify-center">
                  <p className="text-gray-400 text-xs">Total c/ IVA</p>
                  <p className="text-gold-400 font-bold">Kz {previewTotal.toLocaleString('pt-AO')}</p>
                  <p className="text-gray-500 text-xs">IVA: Kz {previewIva.toLocaleString('pt-AO')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Data Emissão</label>
                  <input
                    type="date"
                    value={form.dataEmissao}
                    onChange={(e) => setForm({ ...form, dataEmissao: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Data Vencimento</label>
                  <input
                    type="date"
                    value={form.dataVencimento}
                    onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as FaturaStatus })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="emitida">Emitida</option>
                    <option value="paga">Paga</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Meio de Pagamento</label>
                  <select
                    value={form.meioPagamento}
                    onChange={(e) => setForm({ ...form, meioPagamento: e.target.value as MeioPagamento | '' })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="">Não definido</option>
                    <option value="numerario">Numerário</option>
                    <option value="transferencia">Transferência</option>
                    <option value="multibanco">Multibanco</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.clienteId || form.subtotal <= 0}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Guardar' : 'Emitir Fatura'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Excluir Fatura</h3>
                <p className="text-gray-400 text-sm">Esta acção não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
