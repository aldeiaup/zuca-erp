import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store';
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Building2, User, X, Save } from 'lucide-react';

export default function Clientes() {
  const { clientes, viaturas, addCliente, updateCliente, deleteCliente } = useStore();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<{ nome: string; tipo: 'particular' | 'empresa'; telefone: string; email: string; cidade: string; nif: string; bi: string }>({ nome: '', tipo: 'particular', telefone: '', email: '', cidade: 'Luanda', nif: '', bi: '' });

  const filtered = clientes.filter(c => 
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getClienteViaturas = (id: string) => viaturas.filter(v => v.clienteId === id);
  const clienteSelecionado = selectedCliente ? clientes.find(c => c.id === selectedCliente) : null;
  const viaturasDoCliente = selectedCliente ? getClienteViaturas(selectedCliente) : [];

  const handleSubmit = () => {
    if (!form.nome || !form.telefone) return;
    if (editingId) {
      updateCliente(editingId, form);
      toast.success('Cliente actualizado com sucesso!');
    } else {
      addCliente(form);
      toast.success('Cliente criado com sucesso!');
    }
    setShowModal(false);
    setEditingId(null);
    setForm({ nome: '', tipo: 'particular', telefone: '', email: '', cidade: 'Luanda', nif: '', bi: '' });
  };

  const handleEdit = (id: string) => {
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
      setForm({ nome: cliente.nome, tipo: cliente.tipo, telefone: cliente.telefone, email: cliente.email || '', cidade: cliente.cidade, nif: cliente.nif || '', bi: cliente.bi || '' });
      setEditingId(id);
      setShowModal(true);
      setSelectedCliente(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteCliente(id);
    setShowDeleteConfirm(null);
    if (selectedCliente === id) setSelectedCliente(null);
    toast.error('Cliente eliminado');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-gray-400">{clientes.length} clientes registados</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setEditingId(null); setForm({ nome: '', tipo: 'particular', telefone: '', email: '', cidade: 'Luanda', nif: '', bi: '' }); setSelectedCliente(null); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Total de Clientes</p>
          <p className="text-3xl font-bold text-white mt-1">{clientes.length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Particulares</p>
          <p className="text-3xl font-bold text-blue-400 mt-1">{clientes.filter(c => c.tipo === 'particular').length}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50">
          <p className="text-gray-400 text-sm">Empresas</p>
          <p className="text-3xl font-bold text-purple-400 mt-1">{clientes.filter(c => c.tipo === 'empresa').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar por nome, telefone ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((cliente) => (
              <div 
                key={cliente.id} 
                onClick={() => setSelectedCliente(cliente.id)}
                className={`group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border transition-all cursor-pointer hover:scale-[1.02] ${
                  selectedCliente === cliente.id ? 'border-gold-500 shadow-lg shadow-gold-500/20' : 'border-gray-700/50 hover:border-gold-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {cliente.tipo === 'empresa' ? <Building2 className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors">{cliente.nome}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                        cliente.tipo === 'empresa' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(cliente.id); }} className="p-2 text-gray-400 hover:text-gold-400 hover:bg-gray-700 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(cliente.id); }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4 text-gold-500" />
                    {cliente.telefone}
                  </div>
                  {cliente.email && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Mail className="w-4 h-4 text-gold-500" />
                      {cliente.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-gold-500" />
                    {cliente.cidade}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-between">
                  <span className="text-gray-500 text-sm">{getClienteViaturas(cliente.id).length} viaturas</span>
                  {cliente.nif && <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">NIF: {cliente.nif}</span>}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/50">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Nenhum cliente encontrado</p>
              <button onClick={() => setShowModal(true)} className="mt-4 text-gold-400 hover:text-gold-300">
                Adicionar primeiro cliente
              </button>
            </div>
          )}
        </div>

        <div className="xl:col-span-1">
          {clienteSelecionado ? (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Detalhes do Cliente</h3>
                <button onClick={() => setSelectedCliente(null)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  {clienteSelecionado.tipo === 'empresa' ? <Building2 className="w-10 h-10 text-white" /> : <User className="w-10 h-10 text-white" />}
                </div>
                <h4 className="text-xl font-bold text-white">{clienteSelecionado.nome}</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  clienteSelecionado.tipo === 'empresa' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {clienteSelecionado.tipo === 'empresa' ? 'Empresa' : 'Particular'}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Telefone</p>
                  <p className="text-white">{clienteSelecionado.telefone}</p>
                </div>
                {clienteSelecionado.email && (
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Email</p>
                    <p className="text-white">{clienteSelecionado.email}</p>
                  </div>
                )}
                <div className="bg-gray-700/30 rounded-xl p-4">
                  <p className="text-gray-400 text-xs mb-1">Cidade</p>
                  <p className="text-white">{clienteSelecionado.cidade}</p>
                </div>
                {clienteSelecionado.nif && (
                  <div className="bg-gray-700/30 rounded-xl p-4">
                    <p className="text-gray-400 text-xs mb-1">NIF</p>
                    <p className="text-gold-400 font-mono">{clienteSelecionado.nif}</p>
                  </div>
                )}
              </div>

              <div>
                <h5 className="text-white font-medium mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Viaturas ({viaturasDoCliente.length})
                </h5>
                {viaturasDoCliente.length > 0 ? (
                  <div className="space-y-2">
                    {viaturasDoCliente.map(v => (
                      <div key={v.id} className="bg-gray-700/30 rounded-xl p-3 border border-gray-700/50 hover:border-gold-500/30 transition-colors">
                        <p className="text-white font-medium">{v.marca} {v.modelo}</p>
                        <p className="text-gold-400 text-sm font-mono">{v.matricula}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Sem viaturas registadas</p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 text-center">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Selecione um cliente para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tipo: 'particular' })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      form.tipo === 'particular' ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-gray-700 border-gray-600 text-gray-400'
                    }`}
                  >
                    Particular
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, tipo: 'empresa' })}
                    className={`px-4 py-3 rounded-xl border transition-all ${
                      form.tipo === 'empresa' ? 'bg-gold-500/20 border-gold-500 text-gold-400' : 'bg-gray-700 border-gray-600 text-gray-400'
                    }`}
                  >
                    Empresa
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Telefone *</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{form.tipo === 'empresa' ? 'NIF' : 'BI'}</label>
                  <input
                    type="text"
                    value={form.tipo === 'empresa' ? form.nif : form.bi}
                    onChange={(e) => setForm({ ...form, [form.tipo === 'empresa' ? 'nif' : 'bi']: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-xl hover:bg-gray-600 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} className="flex-1 btn-primary flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                {editingId ? 'Guardar' : 'Criar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Eliminação */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-sm border border-gray-700 shadow-2xl p-6">
            <h3 className="text-white font-bold mb-2">Eliminar Cliente</h3>
            <p className="text-gray-400 text-sm mb-6">Tem certeza que deseja eliminar este cliente? Esta ação removerá o registo permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-xl">Cancelar</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
