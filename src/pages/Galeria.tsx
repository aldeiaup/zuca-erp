import { useState } from 'react';
import { Image, Upload, X, Eye, Download, Trash2, Search, Heart, Share2, MessageCircle, Phone } from 'lucide-react';

export default function Galeria() {
  const [images, setImages] = useState([
    { id: '1', url: '/images/carros/IMG-20240314-WA0067-768x1024.jpg', titulo: 'Restauração de Pintura — Desportivo', categoria: 'Pintura', likes: 24 },
    { id: '2', url: '/images/carros/IMG-20240314-WA0083-1-768x1024.jpg', titulo: 'Toyota Land Cruiser — Detalhamento', categoria: 'Portfolio', likes: 38 },
    { id: '3', url: '/images/carros/carro-768x1024.jpg', titulo: 'SUV Premium — Frente', categoria: 'Portfolio', likes: 32 },
    { id: '4', url: '/images/carros/trolerdepoisfrente-768x1024.jpg', titulo: 'Troller T4 — Frente (Depois)', categoria: 'Antes & Depois', likes: 45 },
    { id: '5', url: '/images/carros/trolerdepoistraseira-768x1024.jpg', titulo: 'Troller T4 — Traseira (Depois)', categoria: 'Antes & Depois', likes: 41 },
  ]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['all', ...new Set(images.map(img => img.categoria))];

  const filtered = images.filter(img => {
    const matchFilter = filter === 'all' || img.categoria === filter;
    const matchSearch = img.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleDelete = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const handleLike = (id: string) => {
    setImages(images.map(img => img.id === id ? { ...img, likes: img.likes + 1 } : img));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Galeria</h1>
          <p className="text-gray-400">Portfólio e imagens da empresa</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Imagem
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
            <Image className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{images.length}</p>
          <p className="text-gray-400 text-sm">Total de Imagens</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">{images.reduce((a, img) => a + img.likes, 0)}</p>
          <p className="text-gray-400 text-sm">Total de Likes</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <p className="text-2xl font-bold text-white">8</p>
          <p className="text-gray-400 text-sm">Partilhas</p>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Pesquisar imagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === cat ? 'bg-gold-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((img) => (
          <div key={img.id} className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gold-500/50 transition-all">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={img.url} alt={img.titulo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-semibold">{img.titulo}</p>
                <span className="text-gold-400 text-sm">{img.categoria}</span>
              </div>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setSelectedImage(img.id)} className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                  <Eye className="w-4 h-4 text-white" />
                </button>
                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                  <Download className="w-4 h-4 text-white" />
                </button>
                <button onClick={() => handleDelete(img.id)} className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500 transition-colors">
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => handleLike(img.id)} className="flex items-center gap-1 text-gray-400 hover:text-pink-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{img.likes}</span>
                </button>
                <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-gold-400 hover:bg-gray-700 rounded-lg transition-colors">
                  <Image className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gold-400 hover:bg-gray-700 rounded-lg transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-700/50">
          <Image className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">Nenhuma imagem encontrada</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          Integração WhatsApp Business API
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-2">Status da Conexão</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-emerald-400 font-medium">Conectado</span>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-2">Número Vinculado</p>
            <p className="text-white font-medium">+244 923 456 789</p>
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
          Configurar Integração
        </button>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl w-full">
            <img src={images.find(img => img.id === selectedImage)?.url} alt="" className="w-full rounded-2xl" />
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-white font-semibold">{images.find(img => img.id === selectedImage)?.titulo}</p>
                <p className="text-gray-400">{images.find(img => img.id === selectedImage)?.categoria}</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar
                </button>
                <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Partilhar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
