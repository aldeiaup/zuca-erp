import { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, FileText, Download, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Relatorios() {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [exporting, setExporting] = useState<string | null>(null);

  const relatorios = [
    { id: '1', titulo: 'Resumo Financeiro', descricao: 'Visão geral de receitas e despesas', tipo: 'financeiro', icone: BarChart3, cor: 'from-emerald-500 to-emerald-600' },
    { id: '2', titulo: 'Vendas por Serviço', descricao: 'Análise de serviços mais prestados', tipo: 'vendas', icone: TrendingUp, cor: 'from-blue-500 to-blue-600' },
    { id: '3', titulo: 'Produtividade', descricao: 'Métricas de ordens de serviço', tipo: 'operacional', icone: Calendar, cor: 'from-purple-500 to-purple-600' },
    { id: '4', titulo: 'Faturas Emitidas', descricao: 'Relatório fiscal de documentos', tipo: 'fiscal', icone: FileText, cor: 'from-amber-500 to-amber-600' },
    { id: '5', titulo: 'Estoque', descricao: 'Movimentação de peças e materiais', tipo: 'estoque', icone: PieChart, cor: 'from-red-500 to-red-600' },
    { id: '6', titulo: 'Clientes', descricao: 'Análise de clientes e viaturas', tipo: 'clientes', icone: BarChart3, cor: 'from-cyan-500 to-cyan-600' },
  ];

  const metricas = [
    { label: 'Total de OS', valor: '156', variacao: '+12%', positivo: true },
    { label: 'Receita Mensal', valor: 'Kz 2.4M', variacao: '+8%', positivo: true },
    { label: 'Tickets Médios', valor: 'Kz 45.2K', variacao: '-3%', positivo: false },
    { label: 'Taxa Conclusão', valor: '94%', variacao: '+2%', positivo: true },
  ];

  const servicosPopulares = [
    { nome: 'Revisão Completa', quantidade: 45, percentagem: 28 },
    { nome: 'Mudança de Óleo', quantidade: 38, percentagem: 24 },
    { nome: 'Travagem', quantidade: 25, percentagem: 16 },
    { nome: 'Diagnóstico', quantidade: 20, percentagem: 13 },
    { nome: 'Elétrica', quantidade: 18, percentagem: 11 },
    { nome: 'Outros', quantidade: 14, percentagem: 8 },
  ];

  const handleExport = (id: string, format: 'pdf' | 'excel') => {
    setExporting(`${id}-${format}`);
    setTimeout(() => {
      setExporting(null);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Relatórios</h1>
          <p className="text-gray-400">Análises e estatísticas do sistema</p>
        </div>
        <div className="flex gap-2">
          {['semana', 'mes', 'ano'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period ? 'bg-gold-500 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {period === 'semana' ? 'Esta Semana' : period === 'mes' ? 'Este Mês' : 'Este Ano'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricas.map((metrica, index) => (
          <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <p className="text-gray-400 text-sm">{metrica.label}</p>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                metrica.positivo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {metrica.positivo ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {metrica.variacao}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">{metrica.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Serviços Mais Prestados</h3>
            <button className="text-gold-400 hover:text-gold-300 text-sm font-medium">Ver completo</button>
          </div>
          <div className="space-y-4">
            {servicosPopulares.map((servico, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-white">{servico.nome}</span>
                  <span className="text-gray-400">{servico.quantidade} ({servico.percentagem}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 transition-all"
                    style={{ width: `${servico.percentagem}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-6">Por Categoria</h3>
          <div className="space-y-4">
            {[
              { nome: 'Mecânica', valor: 45, cor: 'bg-blue-500' },
              { nome: 'Elétrica', valor: 25, cor: 'bg-amber-500' },
              { nome: 'Revisões', valor: 20, cor: 'bg-emerald-500' },
              { nome: 'Outros', valor: 10, cor: 'bg-purple-500' },
            ].map((cat, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${cat.cor}`} />
                <span className="text-gray-300 flex-1">{cat.nome}</span>
                <span className="text-white font-medium">{cat.valor}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-6">Relatórios Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatorios.map((relatorio) => (
            <div key={relatorio.id} className="bg-gray-700/30 rounded-xl p-5 border border-gray-700/50 hover:border-gold-500/50 transition-all group overflow-hidden">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${relatorio.cor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <relatorio.icone className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-1">{relatorio.titulo}</h4>
              <p className="text-gray-400 text-sm mb-4">{relatorio.descricao}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleExport(relatorio.id, 'pdf')}
                  disabled={!!exporting}
                  className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {exporting === `${relatorio.id}-pdf` ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {exporting === `${relatorio.id}-pdf` ? 'A gerar...' : 'PDF'}
                </button>
                <button 
                  onClick={() => handleExport(relatorio.id, 'excel')}
                  disabled={!!exporting}
                  className="flex-1 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {exporting === `${relatorio.id}-excel` ? (
                    <div className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  {exporting === `${relatorio.id}-excel` ? 'A gerar...' : 'Excel'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
