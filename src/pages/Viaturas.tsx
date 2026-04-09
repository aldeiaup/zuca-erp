import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store';
import type { Viatura } from '../store';
import { Search, Plus, Edit2, Car as CarIcon, User, Calendar, Gauge, Palette, Fuel, X, Trash2, Save } from 'lucide-react';

type ViaturaForm = Omit<Viatura, 'id'>;

const emptyForm: ViaturaForm = {
  clienteId: '',
  marca: '',
  modelo: '',
  ano: new Date().getFullYear(),
  matricula: '',
  chassis: '',
  cor: '',
  combustivel: 'Gasolina',
  kilometragem: 0,
};

export default function Viaturas() {
  const { viaturas, clientes, addViatura, updateViatura, deleteViatura } = useStore();
  const [search, setSearch] = useState('');
  const [selectedViatura, setSelectedViatura] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ViaturaForm>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || 'N/A';
  const getCliente = (id: string) => clientes.find(c => c.id === id);
  const viaturaSelecionada = selectedViatura ? viaturas.find(v => v.id === selectedViatura) : null;

  const filtered = viaturas.filter(v =>
    v.marca.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo.toLowerCase().includes(search.toLowerCase()) ||
    v.matricula.toLowerCase().includes(search.toLowerCase())
  );

  const marcasCount = viaturas.reduce((acc, v) => {
    acc[v.marca] = (acc[v.marca] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (viatura: Viatura) => {
    setEditingId(viatura.id);
    setForm({
      clienteId: viatura.clienteId,
      marca: viatura.marca,
      modelo: viatura.modelo,
      ano: viatura.ano,
      matricula: viatura.matricula,
      chassis: viatura.chassis || '',
      cor: viatura.cor || '',
      combustivel: viatura.combustivel || 'Gasolina',
      kilometragem: viatura.kilometragem || 0,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.clienteId || !form.marca || !form.modelo || !form.matricula) return;
    if (editingId) {
      updateViatura(editingId, form);
      toast.success('Viatura actualizada com sucesso!');
    } else {
      addViatura(form);
      toast.success('Viatura registada com sucesso!');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteViatura(id);
    setShowDeleteConfirm(null);
    if (selectedViatura === id) setSelectedViatura(null);
    toast.error('Viatura eliminada');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Viaturas</h1>
          <p className="text-gray-400">{viaturas.length} viaturas registadas</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova Viatura
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mb-3">
            <CarIcon className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-bold text-white">{viaturas.length}</p>
          <p className="text-gray-400 text-sm">Total Viaturas</p>
        </div>
        {Object.entries(marcasCount).slice(0, 3).map(([marca, count]) => (
          <div key={marca} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
            <p className="text-3xl font-bold text-gold-400">{count}</p>
            <p className="text-gray-400 text-sm">{marca}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`${viaturaSelecionada ? 'lg:w-1/2' : 'w-full'} space-y-4`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar por marca, modelo ou matrícula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((viatura) => {
              const isSelected = selectedViatura === viatura.id;
              return (
                <div
                  key={viatura.id}
                  onClick={() => setSelectedViatura(isSelected ? null : viatura.id)}
                  className={`group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border cursor-pointer transition-all hover:scale-[1.02] ${
                    isSelected
                      ? 'border-gold-500 shadow-lg shadow-gold-500/20'
                      : 'border-gray-700/50 hover:border-gold-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CarIcon className="w-7 h-7 text-gold-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold group-hover:text-gold-400 transition-colors">{viatura.marca} {viatura.modelo}</h3>
                        <p className="text-gold-400 font-mono text-sm">{viatura.matricula}</p>
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm">{viatura.ano}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {viatura.cor && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Palette className="w-4 h-4 text-gray-500" />
                        {viatura.cor}
                      </div>
                    )}
                    {viatura.combustivel && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Fuel className="w-4 h-4 text-gray-500" />
                        {viatura.combustivel}
                      </div>
                    )}
                    {viatura.kilometragem !== undefined && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm col-span-2">
                        <Gauge className="w-4 h-4 text-gray-500" />
                        {viatura.kilometragem.toLocaleString()} km
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-300">{getClienteNome(viatura.clienteId)}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEdit(viatura)}
                        className="p-1.5 text-gray-400 hover:text-gold-400 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(viatura.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/50">
              <CarIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Nenhuma viatura encontrada</p>
              <button onClick={openAdd} className="mt-4 text-gold-400 hover:text-gold-300 text-sm font-medium">
                + Adicionar viatura
              </button>
            </div>
          )}
        </div>

        {viaturaSelecionada && (
          <div className="lg:w-1/2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CarIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{viaturaSelecionada.marca} {viaturaSelecionada.modelo}</h3>
                    <p className="text-gold-400 font-mono">{viaturaSelecionada.matricula}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedViatura(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Ano</p>
                    <p className="text-white font-medium">{viaturaSelecionada.ano}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Cor</p>
                    <p className="text-white font-medium">{viaturaSelecionada.cor || '-'}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Combustível</p>
                    <p className="text-white font-medium">{viaturaSelecionada.combustivel || '-'}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Kilometragem</p>
                    <p className="text-white font-medium">{viaturaSelecionada.kilometragem?.toLocaleString() || '-'} km</p>
                  </div>
                </div>

                {viaturaSelecionada.chassis && (
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Número de Chassi</p>
                    <p className="text-white font-mono">{viaturaSelecionada.chassis}</p>
                  </div>
                )}

                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-2">Proprietário</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-500/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gold-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{getClienteNome(viaturaSelecionada.clienteId)}</p>
                      {getCliente(viaturaSelecionada.clienteId)?.telefone && (
                        <p className="text-gray-400 text-sm">{getCliente(viaturaSelecionada.clienteId)?.telefone}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => openEdit(viaturaSelecionada)}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-5 h-5" />
                    Editar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(viaturaSelecionada.id)}
                    className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Excluir
                  </button>
                  <button className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Agendar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Adicionar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Viatura' : 'Nova Viatura'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Proprietário *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Marca *</label>
                  <input
                    type="text"
                    value={form.marca}
                    onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    placeholder="BMW, Toyota..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Modelo *</label>
                  <input
                    type="text"
                    value={form.modelo}
                    onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                    placeholder="X5, Hilux..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Ano *</label>
                  <input
                    type="number"
                    value={form.ano}
                    onChange={(e) => setForm({ ...form, ano: Number(e.target.value) })}
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Matrícula *</label>
                  <input
                    type="text"
                    value={form.matricula}
                    onChange={(e) => setForm({ ...form, matricula: e.target.value.toUpperCase() })}
                    placeholder="LD-00-00-AA"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Cor</label>
                  <input
                    type="text"
                    value={form.cor}
                    onChange={(e) => setForm({ ...form, cor: e.target.value })}
                    placeholder="Preto, Branco..."
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Combustível</label>
                  <select
                    value={form.combustivel}
                    onChange={(e) => setForm({ ...form, combustivel: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Elétrico">Elétrico</option>
                    <option value="GLP">GLP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Kilometragem</label>
                  <input
                    type="number"
                    value={form.kilometragem}
                    onChange={(e) => setForm({ ...form, kilometragem: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Chassi (VIN)</label>
                  <input
                    type="text"
                    value={form.chassis}
                    onChange={(e) => setForm({ ...form, chassis: e.target.value.toUpperCase() })}
                    placeholder="Número de chassi"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.clienteId || !form.marca || !form.modelo || !form.matricula}
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

      {/* Modal Confirmar Exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Excluir Viatura</h3>
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
