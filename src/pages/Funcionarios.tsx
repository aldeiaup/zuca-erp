import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store';
import type { Funcionario } from '../store';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Users, Plus, Edit2, Mail, Phone, Calendar, Briefcase, DollarSign, Shield, X, Trash2, Save, Search } from 'lucide-react';

type FuncionarioForm = Omit<Funcionario, 'id' | 'ativo'>;

const emptyForm: FuncionarioForm = {
  nome: '',
  cargo: '',
  tipo: 'funcionario',
  email: '',
  telefone: '',
  dataAdmissao: new Date().toISOString().split('T')[0] as unknown as Date,
  salario: 0,
  nif: '',
};

const getTipoBadge = (tipo: string) => {
  const badges: Record<string, { bg: string; text: string; label: string }> = {
    master: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Master' },
    admin: { bg: 'bg-gold-500/20', text: 'text-gold-400', label: 'Administrador' },
    gerente: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Gerente' },
    funcionario: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Funcionário' },
  };
  return badges[tipo] || badges.funcionario;
};

export default function Funcionarios() {
  const { funcionarios, addFuncionario, updateFuncionario, deleteFuncionario } = useStore();
  const [selectedFuncionario, setSelectedFuncionario] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FuncionarioForm & { dataAdmissaoStr: string }>({
    ...emptyForm,
    dataAdmissaoStr: new Date().toISOString().split('T')[0],
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const ativos = funcionarios.filter(f => f.ativo);
  const filtered = ativos.filter(f =>
    f.nome.toLowerCase().includes(search.toLowerCase()) ||
    f.cargo.toLowerCase().includes(search.toLowerCase())
  );

  const funcionarioSelecionado = selectedFuncionario ? funcionarios.find(f => f.id === selectedFuncionario) : null;
  const folhaSalarial = ativos.reduce((a, f) => a + f.salario, 0);
  const inssFuncionario = folhaSalarial * 0.03;
  const inssEmpregador = folhaSalarial * 0.08;

  const openAdd = () => {
    setEditingId(null);
    const today = new Date().toISOString().split('T')[0];
    setForm({ ...emptyForm, dataAdmissaoStr: today });
    setShowModal(true);
  };

  const openEdit = (f: Funcionario) => {
    setEditingId(f.id);
    setForm({
      nome: f.nome,
      cargo: f.cargo,
      tipo: f.tipo,
      email: f.email,
      telefone: f.telefone,
      dataAdmissao: f.dataAdmissao,
      dataAdmissaoStr: new Date(f.dataAdmissao).toISOString().split('T')[0],
      salario: f.salario,
      nif: f.nif,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.cargo || !form.email) return;
    const data = {
      nome: form.nome,
      cargo: form.cargo,
      tipo: form.tipo,
      email: form.email,
      telefone: form.telefone,
      dataAdmissao: new Date(form.dataAdmissaoStr),
      salario: form.salario,
      nif: form.nif,
      ativo: true,
    };
    if (editingId) {
      updateFuncionario(editingId, data);
      toast.success('Funcionário actualizado!');
    } else {
      addFuncionario(data);
      toast.success('Funcionário registado com sucesso!');
    }
    setShowModal(false);
    setSelectedFuncionario(null);
  };

  const handleDelete = (id: string) => {
    deleteFuncionario(id);
    setShowDeleteConfirm(null);
    setSelectedFuncionario(null);
    toast.error('Funcionário desactivado');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Funcionários</h1>
          <p className="text-gray-400">Gestão de recursos humanos - Conformidade LGT Angola</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Novo Funcionário
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Funcionários</p>
          <p className="text-2xl font-bold text-white">{ativos.length}</p>
        </div>
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Folha Salarial</p>
          <p className="text-2xl font-bold text-emerald-400">Kz {(folhaSalarial / 1000).toFixed(1)}K</p>
        </div>
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">INSS (3% Func.)</p>
          <p className="text-2xl font-bold text-amber-400">Kz {(inssFuncionario / 1000).toFixed(1)}K</p>
        </div>
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400 text-sm mb-1">INSS (8% Emp.)</p>
          <p className="text-2xl font-bold text-purple-400">Kz {(inssEmpregador / 1000).toFixed(1)}K</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-semibold text-white">Lista de Funcionários</h3>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((funcionario) => {
            const badge = getTipoBadge(funcionario.tipo);
            return (
              <div
                key={funcionario.id}
                className="group bg-gray-700/30 rounded-xl p-5 border border-gray-700/50 hover:border-gold-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedFuncionario(funcionario.id)}>
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">{funcionario.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{funcionario.nome}</h4>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(funcionario)}
                      className="p-1.5 text-gray-400 hover:text-gold-400 hover:bg-gray-700 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(funcionario.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    {funcionario.cargo}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    {funcionario.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    {funcionario.telefone}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center">
                  <span className="text-gold-400 font-bold">Kz {funcionario.salario.toLocaleString('pt-AO')}</span>
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(funcionario.dataAdmissao), 'MMM yyyy', { locale: pt })}
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">Nenhum funcionário encontrado</p>
              <button onClick={openAdd} className="mt-4 text-gold-400 hover:text-gold-300 text-sm font-medium">
                + Adicionar funcionário
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-gold-500/10 to-amber-500/10 backdrop-blur-sm rounded-2xl border border-gold-500/30 p-6">
        <h3 className="text-lg font-semibold text-gold-400 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Conformidade Lei Geral do Trabalho (LGT) - Angola
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 mb-1">Horário de Trabalho</p>
            <p className="text-white font-medium">44 horas/semana (Art. 85)</p>
            <p className="text-gray-500 text-xs">8h diárias de segunda a sábado</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 mb-1">Férias Anuais</p>
            <p className="text-white font-medium">22 dias úteis (Art. 91)</p>
            <p className="text-gray-500 text-xs">Férias + 1 dia por cada 3 anos de serviço</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 mb-1">Subsídio de Férias</p>
            <p className="text-white font-medium">1 mês de salário (Art. 92)</p>
            <p className="text-gray-500 text-xs">Pago 30 dias antes das férias</p>
          </div>
        </div>
      </div>

      {/* Modal Detalhes */}
      {funcionarioSelecionado && !showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Detalhes do Funcionário</h3>
              <button onClick={() => setSelectedFuncionario(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">{funcionarioSelecionado.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                </div>
                <h4 className="text-xl font-bold text-white">{funcionarioSelecionado.nome}</h4>
                <p className="text-gray-400">{funcionarioSelecionado.cargo}</p>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">NIF</p>
                  <p className="text-gold-400 font-mono">{funcionarioSelecionado.nif}</p>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Email</p>
                  <p className="text-white">{funcionarioSelecionado.email}</p>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Telefone</p>
                  <p className="text-white">{funcionarioSelecionado.telefone}</p>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Data de Admissão</p>
                  <p className="text-white">{format(new Date(funcionarioSelecionado.dataAdmissao), "dd 'de' MMMM 'de' yyyy", { locale: pt })}</p>
                </div>
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Salário Base</p>
                  <p className="text-gold-400 font-bold text-lg">Kz {funcionarioSelecionado.salario.toLocaleString('pt-AO')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-500/10 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">INSS (3%)</p>
                    <p className="text-amber-400 font-medium">Kz {(funcionarioSelecionado.salario * 0.03).toLocaleString('pt-AO')}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">IRT Estimado</p>
                    <p className="text-purple-400 font-medium">Kz {(funcionarioSelecionado.salario * 0.15).toLocaleString('pt-AO')}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => openEdit(funcionarioSelecionado)}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(funcionarioSelecionado.id)}
                  className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Nome do funcionário..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Cargo *</label>
                  <input
                    type="text"
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    placeholder="Ex: Técnico Mecânico"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Perfil de Acesso</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as Funcionario['tipo'] })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="funcionario">Funcionário</option>
                    <option value="gerente">Gerente</option>
                    <option value="admin">Administrador</option>
                    <option value="master">Master</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@zucamotors.ao"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="+244 9XX XXX XXX"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">NIF</label>
                  <input
                    type="text"
                    value={form.nif}
                    onChange={(e) => setForm({ ...form, nif: e.target.value })}
                    placeholder="0000000000LA"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Data de Admissão</label>
                  <input
                    type="date"
                    value={form.dataAdmissaoStr}
                    onChange={(e) => setForm({ ...form, dataAdmissaoStr: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Salário Base (Kz)</label>
                  <input
                    type="number"
                    value={form.salario}
                    onChange={(e) => setForm({ ...form, salario: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {form.salario > 0 && (
                <div className="grid grid-cols-3 gap-3 bg-gray-700/20 rounded-xl p-3 text-xs">
                  <div>
                    <p className="text-gray-400">Líquido estimado</p>
                    <p className="text-emerald-400 font-bold">Kz {(form.salario * 0.82).toLocaleString('pt-AO')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">INSS (3%)</p>
                    <p className="text-amber-400 font-bold">Kz {(form.salario * 0.03).toLocaleString('pt-AO')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">IRT estimado</p>
                    <p className="text-purple-400 font-bold">Kz {(form.salario * 0.15).toLocaleString('pt-AO')}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.nome || !form.cargo || !form.email}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Guardar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmar Desactivação */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Desactivar Funcionário</h3>
                <p className="text-gray-400 text-sm">O funcionário será marcado como inactivo.</p>
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
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
