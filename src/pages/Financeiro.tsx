import {
  DollarSign, TrendingUp, AlertCircle, CheckCircle, FileText, Download,
  ArrowUpRight, CreditCard, Banknote, Search, Plus, Edit2, Trash2, X, Save,
  Building2, User, Wallet, Landmark, Receipt, Calendar, Users, Calculator,
  PieChart, FileCheck, Coins, RefreshCcw, History, ArrowRightLeft, ShieldAlert,
  Tag, Phone, ShieldCheck, Eye, Printer, Send, Hash
} from 'lucide-react';
import { useStore } from '../store';
import type { Transacao, Fornecedor, CaixaConta, FolhaPagamento, Adiantamento, Fatura } from '../store';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { useState, useMemo } from 'react';
import CashFlowDashboard from '../components/CashFlowDashboard';
import InvoiceManager from '../components/InvoiceManager';
import PayrollDashboard from '../components/PayrollDashboard';

type FaturaStatus = 'rascunho' | 'emitida' | 'paga' | 'cancelada';
type MeioPagamento = 'numerario' | 'transferencia' | 'multibanco';

interface FaturaForm {
  clienteId: string;
  subtotal: number;
  ivaRate: number;
  dataEmissao: string;
  dataVencimento: string;
  status: FaturaStatus;
  meioPagamento: MeioPagamento | '';
}

export default function Financeiro() {
  const { 
    faturas, 
    clientes, 
    transacoes, 
    fornecedores, 
    funcionarios,
    caixasContas,
    folhasPagamento,
    adiantamentos,
    taxasCambio,
    config,
    addTransacao, 
    updateTransacao, 
    deleteTransacao,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    addFatura,
    updateFatura,
    deleteFatura,
    toggleCaixa,
    processarFolha,
    pagarFolha,
    addAdiantamento
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'caixas' | 'transacoes' | 'faturacao' | 'folha' | 'fornecedores'>('dashboard');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'transacao' | 'fornecedor' | 'adiantamento' | 'conta' | 'fatura'>('transacao');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
  const [selectedAno, setSelectedAno] = useState(new Date().getFullYear());
  const [selectedConta, setSelectedConta] = useState<string | 'todos'>('todos');

  // Estados Faturas
  const [selectedFatura, setSelectedFatura] = useState<string | null>(null);
  const [faturaFilter, setFaturaFilter] = useState<'all' | 'paga' | 'emitida'>('all');
  const [faturaForm, setFaturaForm] = useState<FaturaForm>({
    clienteId: '',
    subtotal: 0,
    ivaRate: 14,
    dataEmissao: new Date().toISOString().split('T')[0],
    dataVencimento: '',
    status: 'emitida',
    meioPagamento: '',
  });

  // Estados Financeiro
  const [transacaoForm, setTransacaoForm] = useState<Omit<Transacao, 'id' | 'reciboGerado'>>({
    tipo: 'saida',
    categoria: '',
    valor: 0,
    moeda: 'AOA',
    taxaCambio: 1,
    data: new Date(),
    descricao: '',
    contaId: (caixasContas[0] || {}).id || '',
    metodoPagamento: 'transferencia',
    status: 'concluido',
  });

  const [fornecedorForm, setFornecedorForm] = useState<Omit<Fornecedor, 'id'>>({
    nome: '', nif: '', telefone: '', email: '', categoria: '', endereco: '',
  });

  // Helpers
  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || 'Desconhecido';
  const getFornecedorNome = (id: string) => fornecedores.find(f => f.id === id)?.nome || 'N/A';
  const getCliente = (id: string) => clientes.find(c => c.id === id);

  const resetForms = () => {
    setTransacaoForm({
      tipo: 'saida', categoria: '', valor: 0, moeda: 'AOA', taxaCambio: 1, 
      data: new Date(), descricao: '', contaId: caixasContas[0]?.id || '', 
      metodoPagamento: 'transferencia', status: 'concluido'
    });
    setFaturaForm({
      clienteId: '', subtotal: 0, ivaRate: 14, dataEmissao: new Date().toISOString().split('T')[0], dataVencimento: '', status: 'emitida', meioPagamento: ''
    });
    setFornecedorForm({
      nome: '', nif: '', telefone: '', email: '', categoria: '', endereco: ''
    });
    setEditingId(null);
  };

  const openAdd = () => {
    setEditingId(null);
    resetForms();
    if (activeTab === 'fornecedores') setModalType('fornecedor');
    else if (activeTab === 'faturacao') setModalType('fatura');
    else setModalType('transacao');
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    if ('tipo' in item && 'valor' in item) {
      setModalType('transacao');
      setTransacaoForm({ ...item, data: new Date(item.data) });
    } else if ('nif' in item) {
      setModalType('fornecedor');
      setFornecedorForm({ ...item });
    } else if ('subtotal' in item) {
      setModalType('fatura');
      setFaturaForm({
        clienteId: item.clienteId,
        subtotal: item.subtotal,
        ivaRate: item.subtotal > 0 ? Math.round((item.iva / item.subtotal) * 100) : 14,
        dataEmissao: new Date(item.dataEmissao).toISOString().split('T')[0],
        dataVencimento: item.dataVencimento ? new Date(item.dataVencimento).toISOString().split('T')[0] : '',
        status: item.status,
        meioPagamento: item.meioPagamento || '',
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (modalType === 'transacao') {
      if (editingId) updateTransacao(editingId, transacaoForm);
      else addTransacao(transacaoForm);
    } else if (modalType === 'fornecedor') {
      if (editingId) updateFornecedor(editingId, fornecedorForm);
      else addFornecedor(fornecedorForm);
    } else if (modalType === 'fatura') {
      const iva = Math.round(faturaForm.subtotal * (faturaForm.ivaRate / 100));
      const total = faturaForm.subtotal + iva;
      const data = {
        clienteId: faturaForm.clienteId,
        subtotal: faturaForm.subtotal,
        iva,
        total,
        dataEmissao: new Date(faturaForm.dataEmissao),
        dataVencimento: faturaForm.dataVencimento ? new Date(faturaForm.dataVencimento) : undefined,
        status: faturaForm.status,
        meioPagamento: faturaForm.meioPagamento as MeioPagamento | undefined,
      };
      if (editingId) updateFatura(editingId, data);
      else addFatura(data);
    }
    setShowModal(false);
    resetForms();
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'transacoes') deleteTransacao(id);
    if (activeTab === 'fornecedores') deleteFornecedor(id);
    if (activeTab === 'faturacao') deleteFatura(id);
    setShowDeleteConfirm(null);
  };

  // Cálculos
  const filteredTransacoes = useMemo(() => {
    return transacoes.filter(t => {
      const matchSearch = t.descricao.toLowerCase().includes(search.toLowerCase()) || 
                          t.categoria.toLowerCase().includes(search.toLowerCase());
      const matchConta = selectedConta === 'todos' || t.contaId === selectedConta;
      return matchSearch && matchConta;
    });
  }, [transacoes, search, selectedConta]);

  const filteredFaturas = useMemo(() => {
    return faturas.filter(f => {
      const matchStatus = faturaFilter === 'all' || f.status === faturaFilter;
      const cliente = getCliente(f.clienteId)?.nome || '';
      const matchSearch = f.numero.toLowerCase().includes(search.toLowerCase()) || 
                          cliente.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [faturas, faturaFilter, search, clientes]);

  const totalEmCaixaKz = caixasContas.reduce((acc, c) => acc + c.saldoAOA, 0);
  const totalEmCaixaUsd = caixasContas.reduce((acc, c) => acc + c.saldoUSD, 0);

  const stats = [
    { label: 'Saldo Total (AOA)', value: `Kz ${totalEmCaixaKz.toLocaleString('pt-AO')}`, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Saldo Total (USD)', value: `$ ${totalEmCaixaUsd.toLocaleString('en-US')}`, icon: Banknote, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Faturas Vencidas', value: faturas.filter(f => f.status === 'emitida').length, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Folha Pendente', value: folhasPagamento.filter(f => f.status === 'pendente').length, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const faturaSelecionadaObj = selectedFatura ? faturas.find(f => f.id === selectedFatura) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-800/40 p-6 rounded-3xl border border-gray-700/50">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Módulo Financeiro
            <span className="text-xs px-2 py-1 bg-gold-500/20 text-gold-400 rounded-full font-mono uppercase tracking-wider">Angola Context</span>
          </h1>
          <p className="text-gray-400">Gestão de tesouraria, multibanco, impostos AGT e folha de pagamento</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 transition-all flex items-center gap-2 border border-gray-600">
            <Download className="w-5 h-5" /> Exportar PDF
          </button>
          <button 
            onClick={openAdd}
            className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl hover:shadow-lg hover:shadow-gold-500/20 transition-all flex items-center gap-2 font-bold"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'faturacao' ? 'Emitir Fatura' : 'Nova Transação'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-bl-full -mr-12 -mt-12 transition-all group-hover:w-32 group-hover:h-32 opacity-20`} />
            <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
            <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-800/50 rounded-2xl border border-gray-700/50 w-fit">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: PieChart },
          { id: 'caixas', label: 'Caixas & Contas', icon: Landmark },
          { id: 'transacoes', label: 'Movimentações', icon: History },
          { id: 'faturacao', label: 'Faturação AGT', icon: Receipt },
          { id: 'folha', label: 'Folha Pagamento', icon: Users },
          { id: 'fornecedores', label: 'Fornecedores', icon: Building2 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-medium ${
              activeTab === tab.id 
                ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden min-h-[500px]">
        {activeTab === 'dashboard' && (
          <div className="p-6">
            <CashFlowDashboard />
          </div>
        )}

        {activeTab === 'caixas' && (
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {caixasContas.map((conta) => (
              <div key={conta.id} className="bg-gray-700/30 rounded-2xl border border-gray-700/50 p-6 group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${conta.tipo === 'caixa_fisico' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                    {conta.tipo === 'caixa_fisico' ? <Wallet className="w-5 h-5 text-amber-400" /> : <Landmark className="w-5 h-5 text-blue-400" />}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${conta.aberto ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{conta.aberto ? 'ABERTO' : 'FECHADO'}</span>
                </div>
                <h4 className="text-white font-bold">{conta.nome}</h4>
                <p className="text-xl font-bold text-white mt-2">Kz {conta.saldoAOA.toLocaleString('pt-AO')}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => toggleCaixa(conta.id)} className="flex-1 text-xs py-2 rounded-xl border border-gray-600 text-gray-400 hover:text-white transition-all">{conta.aberto ? 'Fechar' : 'Abrir'}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'transacoes' && (
          <div className="overflow-x-auto">
             <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-gray-900/20">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" placeholder="Pesquisar movimentação..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-gray-900/40 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Data/Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Categoria</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredTransacoes.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className={`text-xs font-bold ${t.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>{t.tipo.toUpperCase()}</p>
                      <p className="text-[10px] text-gray-500">{format(new Date(t.data), 'dd/MM/yyyy')}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{t.categoria}</td>
                    <td className="px-6 py-4 text-white font-bold">{t.moeda} {t.valor.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(t)} className="p-2 text-gray-400 hover:text-gold-400"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setShowDeleteConfirm(t.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'faturacao' && (
          <div className="p-6">
            <InvoiceManager />
          </div>
        )}

        {activeTab === 'folha' && (
          <div className="p-6">
            <PayrollDashboard />
          </div>
        )}

        {activeTab === 'fornecedores' && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fornecedores.map((f) => (
              <div key={f.id} className="bg-gray-700/30 rounded-2xl p-6 border border-gray-700/50 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-gold-500/10 rounded-xl flex items-center justify-center"><Building2 className="w-6 h-6 text-gold-400" /></div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(f)} className="p-2 text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setShowDeleteConfirm(f.id)} className="p-2 text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h4 className="text-white font-bold">{f.nome}</h4>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-2"><Tag className="w-3 h-3" /> {f.categoria}</p>
                <p className="text-xs text-gray-400 flex items-center gap-2"><Phone className="w-3 h-3" /> {f.telefone}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-3xl w-full max-w-lg border border-gray-700 shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Editar' : 'Registar'} {
                modalType === 'transacao' ? 'Transação' : 
                modalType === 'fornecedor' ? 'Fornecedor' : 'Fatura'
              }
            </h3>
            
            {modalType === 'transacao' && (
              <div className="space-y-4">
                <input type="number" placeholder="Valor" value={transacaoForm.valor} onChange={e => setTransacaoForm({...transacaoForm, valor: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none" />
                <input type="text" placeholder="Categoria" value={transacaoForm.categoria} onChange={e => setTransacaoForm({...transacaoForm, categoria: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none" />
                <textarea placeholder="Descrição" value={transacaoForm.descricao} onChange={e => setTransacaoForm({...transacaoForm, descricao: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl h-24 outline-none resize-none" />
              </div>
            )}

            {modalType === 'fornecedor' && (
              <div className="space-y-4">
                <input type="text" placeholder="Nome" value={fornecedorForm.nome} onChange={e => setFornecedorForm({...fornecedorForm, nome: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none" />
                <input type="text" placeholder="NIF" value={fornecedorForm.nif} onChange={e => setFornecedorForm({...fornecedorForm, nif: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none" />
              </div>
            )}

            {modalType === 'fatura' && (
              <div className="space-y-4">
                <select value={faturaForm.clienteId} onChange={e => setFaturaForm({...faturaForm, clienteId: e.target.value})} className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none">
                  <option value="">Selecionar Cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" placeholder="Subtotal" value={faturaForm.subtotal} onChange={e => setFaturaForm({...faturaForm, subtotal: Number(e.target.value)})} className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl outline-none" />
                  <div className="bg-gray-900 border border-gray-700 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Total:</span>
                    <span className="text-gold-400 font-bold">Kz {(faturaForm.subtotal * 1.14).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-gold-500 text-white rounded-xl font-bold">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes Fatura */}
      {faturaSelecionadaObj && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="bg-gray-900 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">{faturaSelecionadaObj.numero}</h3>
                <p className="text-gold-400 text-xs font-mono uppercase tracking-widest">Documento Certificado AGT</p>
              </div>
              <button onClick={() => setSelectedFatura(null)} className="p-2 text-gray-400 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="flex justify-between border-b border-gray-100 pb-8">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">Cliente</p>
                  <p className="text-gray-900 font-bold text-lg">{getClienteNome(faturaSelecionadaObj.clienteId)}</p>
                  <p className="text-gray-500 text-sm">NIF: {getCliente(faturaSelecionadaObj.clienteId)?.nif || '-'}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">Emissão</p>
                  <p className="text-gray-900 font-bold">{format(new Date(faturaSelecionadaObj.dataEmissao), "dd 'de' MMMM, yyyy", { locale: pt })}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900 font-medium font-mono">Kz {faturaSelecionadaObj.subtotal.toLocaleString('pt-AO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA (14%)</span>
                  <span className="text-gray-900 font-medium font-mono">Kz {faturaSelecionadaObj.iva.toLocaleString('pt-AO')}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gold-600 font-mono">Kz {faturaSelecionadaObj.total.toLocaleString('pt-AO')}</span>
                </div>
              </div>
              <div className="pt-8 flex gap-3">
                <button className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"><Printer className="w-5 h-5" /> Imprimir</button>
                <button className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"><Download className="w-5 h-5" /> Baixar PDF</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[80]">
          <div className="bg-gray-800 p-8 rounded-3xl border border-red-500/30 text-center max-w-sm">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Confirmar Exclusão</h3>
            <p className="text-gray-400 text-sm mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold">Cancelar</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
