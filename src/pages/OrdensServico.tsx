import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store';
import type { OrdemServico } from '../store';
import { format, isValid } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  FileText, Search, Plus, Car, Clock, CheckCircle, X, Wrench,
  Trash2, Edit2, AlertCircle, User
} from 'lucide-react';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pendente:       { bg: 'bg-amber-500/20',   text: 'text-amber-400',   label: 'Pendente' },
  em_andamento:   { bg: 'bg-blue-500/20',    text: 'text-blue-400',    label: 'Em Andamento' },
  aguardando_peca:{ bg: 'bg-orange-500/20',  text: 'text-orange-400',  label: 'Aguard. Peça' },
  concluido:      { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Concluído' },
  entregue:       { bg: 'bg-purple-500/20',  text: 'text-purple-400',  label: 'Entregue' },
};

type OSStatus = 'pendente' | 'em_andamento' | 'aguardando_peca' | 'concluido' | 'entregue';

interface OSForm {
  clienteId: string;
  viaturaId: string;
  servico: string;
  descricao: string;
  status: OSStatus;
  total: number | string;
  dataEntrada: string;
  dataPrevista: string;
}

const emptyForm: OSForm = {
  clienteId: '',
  viaturaId: '',
  servico: '',
  descricao: '',
  status: 'pendente',
  total: '',
  dataEntrada: new Date().toISOString().split('T')[0],
  dataPrevista: '',
};

const SERVICOS = [
  'Revisão Completa', 'Troca de Óleo', 'Diagnóstico Electrónico', 'Travagem',
  'Suspensão', 'Caixa de Velocidades', 'Motor', 'Elétrica', 'Ar Condicionado',
  'Pneus / Jantes', 'Pintura / Lataria', 'Vidros', 'Outro',
];

export default function OrdensServico() {
  const {
    ordensServico = [], clientes = [], viaturas = [], funcionarios = [],
    addOrdemServico, updateOrdemServico, deleteOrdemServico,
  } = useStore() as any;

  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedOS, setSelectedOS] = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [form, setForm]             = useState<OSForm>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [errors, setErrors]         = useState<Partial<Record<keyof OSForm, string>>>({});

  const safeFormat = (date: any, fmt: string) => {
    try {
      const d = new Date(date);
      return isValid(d) ? format(d, fmt, { locale: pt }) : '—';
    } catch { return '—'; }
  };

  // Viaturas filtradas pelo cliente seleccionado no form
  const viaturasDoCliente = useMemo(
    () => viaturas.filter((v: any) => v.clienteId === form.clienteId),
    [viaturas, form.clienteId]
  );

  const filtered = useMemo(() => ordensServico.filter((os: any) => {
    const clientName = clientes.find((c: any) => c.id === os.clienteId)?.nome || '';
    const matchSearch = os.numero?.toLowerCase().includes(search.toLowerCase()) ||
                        clientName.toLowerCase().includes(search.toLowerCase()) ||
                        os.servico?.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (!filterStatus || os.status === filterStatus);
  }), [ordensServico, search, filterStatus, clientes]);

  const osSelecionada  = useMemo(() => ordensServico.find((o: any) => o.id === selectedOS) || null, [ordensServico, selectedOS]);
  const totalValor     = useMemo(() => filtered.reduce((acc: number, os: any) => acc + (os.total || 0), 0), [filtered]);
  const statusCounts   = useMemo(() => ({
    total:        ordensServico.length,
    pendente:     ordensServico.filter((o: any) => o.status === 'pendente').length,
    em_andamento: ordensServico.filter((o: any) => o.status === 'em_andamento').length,
    concluido:    ordensServico.filter((o: any) => o.status === 'concluido').length,
  }), [ordensServico]);

  const getClienteNome  = (id: string) => clientes.find((c: any) => c.id === id)?.nome || '—';
  const getViatura      = (id: string) => viaturas.find((v: any) => v.id === id) || null;
  const getTecnico      = (id: string) => funcionarios.find((f: any) => f.id === id)?.nome || null;

  // Validação
  const validate = (): boolean => {
    const e: Partial<Record<keyof OSForm, string>> = {};
    if (!form.clienteId)  e.clienteId  = 'Seleccione o cliente';
    if (!form.viaturaId)  e.viaturaId  = 'Seleccione a viatura';
    if (!form.servico)    e.servico    = 'Seleccione o serviço';
    if (!form.descricao.trim()) e.descricao = 'Descrição obrigatória';
    const total = Number(form.total);
    if (!form.total || isNaN(total) || total <= 0) e.total = 'Valor deve ser maior que 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (os: OrdemServico) => {
    setEditingId(os.id);
    setForm({
      clienteId:    os.clienteId,
      viaturaId:    os.viaturaId,
      servico:      os.servico,
      descricao:    os.descricao,
      status:       os.status as OSStatus,
      total:        os.total,
      dataEntrada:  new Date(os.dataEntrada).toISOString().split('T')[0],
      dataPrevista: os.dataPrevista ? new Date(os.dataPrevista).toISOString().split('T')[0] : '',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = {
      ...form,
      total:        Number(form.total),
      dataEntrada:  new Date(form.dataEntrada),
      dataPrevista: form.dataPrevista ? new Date(form.dataPrevista) : undefined,
    };
    if (editingId) {
      updateOrdemServico(editingId, data);
      toast.success('Ordem de Serviço actualizada!');
    } else {
      addOrdemServico(data);
      toast.success('Ordem de Serviço criada!');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteOrdemServico(id);
    setShowDeleteConfirm(null);
    if (selectedOS === id) setSelectedOS(null);
    toast.error('Ordem de Serviço eliminada');
  };

  const handleStatusChange = (id: string, status: OSStatus) => {
    updateOrdemServico(id, { status });
    toast.success(`Status actualizado para "${statusConfig[status].label}"`);
  };

  const fieldClass = (key: keyof OSForm) =>
    `w-full bg-gray-900 border ${errors[key] ? 'border-red-500' : 'border-gray-700'} text-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-gold-500 transition-colors`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-gold-400" /> Ordens de Serviço
          </h1>
          <p className="text-gray-400 text-sm">Controlo de fluxo de trabalho na oficina</p>
        </div>
        <button onClick={openNew} className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
          <Plus className="w-5 h-5" /> Nova OS
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',        value: statusCounts.total,        icon: FileText,     color: 'text-gray-400',    status: '' },
          { label: 'Pendente',     value: statusCounts.pendente,     icon: Clock,        color: 'text-amber-400',   status: 'pendente' },
          { label: 'Em Andamento', value: statusCounts.em_andamento, icon: Wrench,       color: 'text-blue-400',    status: 'em_andamento' },
          { label: 'Concluído',    value: statusCounts.concluido,    icon: CheckCircle,  color: 'text-emerald-400', status: 'concluido' },
        ].map((s, i) => (
          <button key={i} onClick={() => setFilterStatus(s.status)}
            className={`p-5 rounded-2xl border bg-gray-800/50 transition-all text-left ${filterStatus === s.status ? 'border-gold-500 ring-1 ring-gold-500/50' : 'border-gray-700/50'}`}>
            <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </button>
        ))}
      </div>

      {/* List + Detail */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`space-y-3 ${osSelecionada ? 'lg:w-1/2' : 'w-full'}`}>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input type="text" placeholder="Pesquisar por número, cliente ou serviço…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/40 border border-gray-700 rounded-2xl text-white outline-none focus:ring-2 focus:ring-gold-500/50" />
            </div>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="p-12 text-center text-gray-500 bg-gray-800/30 rounded-2xl border border-gray-700/30">
                Nenhuma ordem encontrada
              </div>
            )}
            {filtered.map((os: any) => {
              const sc = statusConfig[os.status] || statusConfig.pendente;
              const viatura = getViatura(os.viaturaId);
              return (
                <div key={os.id}
                  onClick={() => setSelectedOS(selectedOS === os.id ? null : os.id)}
                  className={`p-4 rounded-2xl border bg-gray-800/30 cursor-pointer transition-all hover:bg-gray-800/50 ${selectedOS === os.id ? 'border-gold-500' : 'border-gray-700/50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${sc.bg} flex items-center justify-center`}>
                        <FileText className={`w-5 h-5 ${sc.text}`} />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{os.numero}</p>
                        <p className="text-[10px] text-gray-500">{getClienteNome(os.clienteId)}</p>
                        {viatura && <p className="text-[10px] text-gold-500">{viatura.marca} {viatura.modelo} · {viatura.matricula}</p>}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sc.bg} ${sc.text}`}>{sc.label.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-gray-700/30">
                    <span className="text-gray-400">{os.servico}</span>
                    <span className="text-gold-400 font-bold">Kz {os.total?.toLocaleString('pt-AO')}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length > 0 && (
            <div className="flex justify-end pt-2">
              <p className="text-sm text-gray-400">Total filtrado: <span className="text-gold-400 font-bold">Kz {totalValor.toLocaleString('pt-AO')}</span></p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {osSelecionada && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/95 p-4 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:w-1/2">
          <div className="bg-gray-800/90 lg:bg-gray-800/40 border border-gray-700 rounded-3xl p-6 h-fit lg:sticky lg:top-6 space-y-5">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white">{osSelecionada.numero}</h3>
              <button onClick={() => setSelectedOS(null)} className="p-2 text-gray-500 hover:text-white"><X /></button>
            </div>

            {/* Status quick-change */}
            <div>
              <p className="text-[10px] text-gray-500 mb-2 uppercase">Alterar Status</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(statusConfig) as OSStatus[]).map(s => (
                  <button key={s} onClick={() => handleStatusChange(osSelecionada.id, s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${osSelecionada.status === s ? `${statusConfig[s].bg} ${statusConfig[s].text} border-current` : 'bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500'}`}>
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/40 p-3 rounded-xl">
                <p className="text-[10px] text-gray-500 mb-1">CLIENTE</p>
                <p className="text-white text-xs font-bold">{getClienteNome(osSelecionada.clienteId)}</p>
              </div>
              <div className="bg-gray-900/40 p-3 rounded-xl">
                <p className="text-[10px] text-gray-500 mb-1">VIATURA</p>
                {getViatura(osSelecionada.viaturaId)
                  ? <p className="text-gold-400 text-xs font-bold">{getViatura(osSelecionada.viaturaId)!.marca} {getViatura(osSelecionada.viaturaId)!.modelo}</p>
                  : <p className="text-gray-500 text-xs">—</p>}
              </div>
              <div className="bg-gray-900/40 p-3 rounded-xl">
                <p className="text-[10px] text-gray-500 mb-1">ENTRADA</p>
                <p className="text-white text-xs font-bold">{safeFormat(osSelecionada.dataEntrada, 'dd/MM/yyyy')}</p>
              </div>
              <div className="bg-gray-900/40 p-3 rounded-xl">
                <p className="text-[10px] text-gray-500 mb-1">VALOR TOTAL</p>
                <p className="text-gold-400 text-sm font-bold">Kz {osSelecionada.total?.toLocaleString('pt-AO')}</p>
              </div>
            </div>

            {osSelecionada.dataPrevista && (
              <div className="bg-gray-900/40 p-3 rounded-xl">
                <p className="text-[10px] text-gray-500 mb-1">DATA PREVISTA</p>
                <p className="text-white text-xs font-bold">{safeFormat(osSelecionada.dataPrevista, 'dd/MM/yyyy')}</p>
              </div>
            )}

            <div className="bg-gray-900/40 p-4 rounded-xl">
              <p className="text-[10px] text-gray-500 mb-2">DESCRIÇÃO</p>
              <p className="text-gray-200 text-sm">{osSelecionada.descricao}</p>
            </div>

            {getTecnico(osSelecionada.tecnicoId) && (
              <div className="bg-gray-900/40 p-3 rounded-xl flex items-center gap-2">
                <User className="w-4 h-4 text-gold-400" />
                <div>
                  <p className="text-[10px] text-gray-500">TÉCNICO</p>
                  <p className="text-white text-xs font-bold">{getTecnico(osSelecionada.tecnicoId)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => openEdit(osSelecionada)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => setShowDeleteConfirm(osSelecionada.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors">
                <Trash2 />
              </button>
            </div>
          </div>
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Editar' : 'Nova'} Ordem de Serviço</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white"><X /></button>
            </div>

            <div className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Cliente *</label>
                <select value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value, viaturaId: '' })}
                  className={fieldClass('clienteId')}>
                  <option value="">Seleccionar Cliente</option>
                  {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                {errors.clienteId && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.clienteId}</p>}
              </div>

              {/* Viatura — filtrada pelo cliente */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Viatura *</label>
                <select value={form.viaturaId}
                  onChange={(e) => setForm({ ...form, viaturaId: e.target.value })}
                  disabled={!form.clienteId}
                  className={`${fieldClass('viaturaId')} disabled:opacity-40 disabled:cursor-not-allowed`}>
                  <option value="">{form.clienteId ? 'Seleccionar Viatura' : 'Seleccione o cliente primeiro'}</option>
                  {viaturasDoCliente.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.matricula}</option>
                  ))}
                </select>
                {errors.viaturaId && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.viaturaId}</p>}
                {form.clienteId && viaturasDoCliente.length === 0 && (
                  <p className="text-amber-400 text-xs mt-1 flex items-center gap-1"><Car className="w-3 h-3" />Este cliente não tem viaturas registadas</p>
                )}
              </div>

              {/* Serviço */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tipo de Serviço *</label>
                <select value={form.servico}
                  onChange={(e) => setForm({ ...form, servico: e.target.value })}
                  className={fieldClass('servico')}>
                  <option value="">Seleccionar Serviço</option>
                  {SERVICOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.servico && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.servico}</p>}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Descrição *</label>
                <textarea value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Descreva o problema ou o trabalho a realizar…"
                  rows={3}
                  className={fieldClass('descricao')} />
                {errors.descricao && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.descricao}</p>}
              </div>

              {/* Técnico */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Técnico Responsável</label>
                <select value={(form as any).tecnicoId || ''}
                  onChange={(e) => setForm({ ...form, ...{ tecnicoId: e.target.value } } as any)}
                  className={fieldClass('servico')}>
                  <option value="">Sem técnico atribuído</option>
                  {funcionarios.filter((f: any) => f.ativo).map((f: any) => (
                    <option key={f.id} value={f.id}>{f.nome} — {f.cargo}</option>
                  ))}
                </select>
              </div>

              {/* Datas + Valor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Data de Entrada *</label>
                  <input type="date" value={form.dataEntrada}
                    onChange={(e) => setForm({ ...form, dataEntrada: e.target.value })}
                    className={fieldClass('dataEntrada')} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Data Prevista de Entrega</label>
                  <input type="date" value={form.dataPrevista}
                    onChange={(e) => setForm({ ...form, dataPrevista: e.target.value })}
                    min={form.dataEntrada}
                    className={fieldClass('dataPrevista')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Valor Total (Kz) *</label>
                  <input type="number" min="0" placeholder="Ex: 85000"
                    value={form.total}
                    onChange={(e) => setForm({ ...form, total: e.target.value })}
                    className={fieldClass('total')} />
                  {errors.total && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.total}</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as OSStatus })}
                    className={fieldClass('status')}>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-bold transition-colors">
                {editingId ? 'Guardar Alterações' : 'Criar OS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar Eliminação */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-bold text-white">Eliminar Ordem de Serviço?</h3>
            </div>
            <p className="text-gray-400 text-sm">Esta acção é irreversível. A OS será removida permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 bg-gray-700 text-white rounded-xl">Cancelar</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
