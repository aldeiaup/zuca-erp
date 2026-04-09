import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../store';
import type { EstoqueItem } from '../store';
import { Package, AlertTriangle, Search, Plus, TrendingUp, Filter, Edit2, Trash2, X, Save } from 'lucide-react';

type EstoqueForm = Omit<EstoqueItem, 'id'>;

const emptyForm: EstoqueForm = {
  codigo: '',
  nome: '',
  categoria: '',
  unidade: 'un',
  precoCusto: 0,
  precoVenda: 0,
  quantidade: 0,
  quantidadeMinima: 5,
};

const categoriasDisponiveis = ['Lubrificantes', 'Travagem', 'Filtros', 'Elétrica', 'Motor', 'Suspensão', 'Transmissão', 'Carroçaria', 'Pneus', 'Outro'];
const unidadesDisponiveis = ['un', 'set', 'kit', 'par', 'lt', 'kg', 'm'];

export default function Estoque() {
  const { estoque, addEstoqueItem, updateEstoqueItem, deleteEstoqueItem } = useStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EstoqueForm>(emptyForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const categories = ['all', ...new Set(estoque.map(e => e.categoria))];
  const filtered = estoque.filter(item => {
    const matchSearch = item.nome.toLowerCase().includes(search.toLowerCase()) || item.codigo.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || item.categoria === filterCategory;
    return matchSearch && matchCategory;
  });

  const estoqueBaixo = estoque.filter(e => e.quantidade <= e.quantidadeMinima);
  const totalItens = estoque.reduce((a, e) => a + e.quantidade, 0);
  const valorTotal = estoque.reduce((a, e) => a + (e.quantidade * e.precoVenda), 0);
  const valorCusto = estoque.reduce((a, e) => a + (e.quantidade * e.precoCusto), 0);
  const margemLucro = valorTotal - valorCusto;

  const getStockStatus = (item: EstoqueItem) => {
    if (item.quantidade === 0) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Esgotado' };
    if (item.quantidade <= item.quantidadeMinima) return { color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'Baixo' };
    if (item.quantidade <= item.quantidadeMinima * 2) return { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Médio' };
    return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Normal' };
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: EstoqueItem) => {
    setEditingId(item.id);
    setForm({
      codigo: item.codigo,
      nome: item.nome,
      categoria: item.categoria,
      unidade: item.unidade,
      precoCusto: item.precoCusto,
      precoVenda: item.precoVenda,
      quantidade: item.quantidade,
      quantidadeMinima: item.quantidadeMinima,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.codigo || !form.nome || !form.categoria) return;
    if (editingId) {
      updateEstoqueItem(editingId, form);
      toast.success('Produto actualizado!');
    } else {
      addEstoqueItem(form);
      toast.success('Produto adicionado ao estoque!');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    deleteEstoqueItem(id);
    setShowDeleteConfirm(null);
    toast.error('Produto removido do estoque');
  };

  const margem = (item: EstoqueItem) =>
    item.precoCusto > 0 ? ((item.precoVenda - item.precoCusto) / item.precoCusto * 100).toFixed(0) : '0';

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Estoque</h1>
          <p className="text-gray-400">Gestão de peças e materiais</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Adicionar Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {estoque.length} SKUs
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Total de Itens</p>
          <p className="text-2xl font-bold text-white">{totalItens.toLocaleString()}</p>
        </div>

        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Valor em Stock</p>
          <p className="text-2xl font-bold text-emerald-400">Kz {(valorTotal / 1000).toFixed(1)}K</p>
        </div>

        <div className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Margem Bruta</p>
          <p className="text-2xl font-bold text-purple-400">Kz {(margemLucro / 1000).toFixed(1)}K</p>
        </div>

        <div className={`group backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${
          estoqueBaixo.length > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-gray-800/50 border-gray-700/50 hover:border-gold-500/50'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
              estoqueBaixo.length > 0 ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            }`}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-1">Stock Baixo</p>
          <p className={`text-2xl font-bold ${estoqueBaixo.length > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
            {estoqueBaixo.length}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent backdrop-blur-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500 backdrop-blur-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat === 'all' ? 'Todas Categorias' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const status = getStockStatus(item);
          const stockPercentage = Math.min(100, (item.quantidade / (item.quantidadeMinima * 3)) * 100);

          return (
            <div key={item.id} className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all hover:shadow-xl hover:shadow-gold-500/5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gold-400 text-xs font-mono bg-gold-500/10 px-2 py-1 rounded inline-block mb-2">{item.codigo}</p>
                  <h3 className="text-white font-semibold group-hover:text-gold-400 transition-colors">{item.nome}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Categoria</span>
                  <span className="text-white">{item.categoria}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Preço Custo</span>
                  <span className="text-gray-300">Kz {item.precoCusto.toLocaleString('pt-AO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Preço Venda</span>
                  <span className="text-gold-400 font-medium">Kz {item.precoVenda.toLocaleString('pt-AO')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Margem</span>
                  <span className="text-emerald-400">+{margem(item)}%</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Stock</span>
                  <span className={`font-bold ${status.color}`}>{item.quantidade} {item.unidade}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.quantidade <= item.quantidadeMinima ? 'bg-orange-500' :
                      item.quantidade <= item.quantidadeMinima * 2 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${stockPercentage}%` }}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">Mínimo: {item.quantidadeMinima} {item.unidade}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEdit(item)}
                  className="flex-1 px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(item.id)}
                  className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/50">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">Nenhum produto encontrado</p>
          <button onClick={openAdd} className="mt-4 text-gold-400 hover:text-gold-300 text-sm font-medium">
            + Adicionar produto
          </button>
        </div>
      )}

      {/* Modal Adicionar / Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between sticky top-0 bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-white">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Código *</label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                    placeholder="PROD-001"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Unidade</label>
                  <select
                    value={form.unidade}
                    onChange={(e) => setForm({ ...form, unidade: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  >
                    {unidadesDisponiveis.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  placeholder="Descrição do produto..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Categoria *</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  <option value="">Selecionar categoria...</option>
                  {categoriasDisponiveis.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Preço Custo (Kz)</label>
                  <input
                    type="number"
                    value={form.precoCusto}
                    onChange={(e) => setForm({ ...form, precoCusto: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Preço Venda (Kz)</label>
                  <input
                    type="number"
                    value={form.precoVenda}
                    onChange={(e) => setForm({ ...form, precoVenda: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {form.precoCusto > 0 && form.precoVenda > 0 && (
                <div className="bg-emerald-500/10 rounded-xl p-3 text-sm text-emerald-400">
                  Margem: +{((form.precoVenda - form.precoCusto) / form.precoCusto * 100).toFixed(1)}%
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Quantidade</label>
                  <input
                    type="number"
                    value={form.quantidade}
                    onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Qtd. Mínima</label>
                  <input
                    type="number"
                    value={form.quantidadeMinima}
                    onChange={(e) => setForm({ ...form, quantidadeMinima: Number(e.target.value) })}
                    min={0}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.codigo || !form.nome || !form.categoria}
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
                <h3 className="text-white font-bold">Excluir Produto</h3>
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
