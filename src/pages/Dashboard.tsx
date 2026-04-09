import { BarChart3, FileText, DollarSign, Users, TrendingUp, Calendar, Car, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function Dashboard() {
  const { ordensServico, faturas, clientes, agenda, estoque, viaturas, user } = useStore();
  const hoje = new Date();

  const ordensAbertas = ordensServico.filter(o => ['pendente', 'em_andamento', 'aguardando_peca'].includes(o.status));
  const faturasPendentes = faturas.filter(f => f.status === 'emitida');
  const faturasPagas = faturas.filter(f => f.status === 'paga');
  const totalReceita = faturasPagas.reduce((a, f) => a + f.total, 0);
  const estoqueBaixo = estoque.filter(e => e.quantidade <= e.quantidadeMinima);

  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || 'N/A';
  const getViaturaInfo = (id: string) => viaturas.find(v => v.id === id);

  const estatisticas = [
    { 
      label: 'Ordens Abertas', 
      value: ordensAbertas.length, 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600',
      trend: '+12%',
      positive: true
    },
    { 
      label: 'Receita Mensal', 
      value: `Kz ${(totalReceita / 1000).toFixed(1)}K`, 
      icon: DollarSign, 
      color: 'from-emerald-500 to-emerald-600',
      trend: '+8%',
      positive: true
    },
    { 
      label: 'Clientes Ativos', 
      value: clientes.length, 
      icon: Users, 
      color: 'from-purple-500 to-purple-600',
      trend: '+5%',
      positive: true
    },
    { 
      label: 'Faturas Pendentes', 
      value: faturasPendentes.length, 
      icon: TrendingUp, 
      color: 'from-amber-500 to-amber-600',
      trend: '-3%',
      positive: false
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pendente: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Pendente' },
      em_andamento: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Em Andamento' },
      aguardando_peca: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Aguard. Peça' },
      concluido: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Concluído' },
      entregue: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Entregue' },
    };
    return badges[status] || badges.pendente;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Bom dia, <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">{user?.nome?.split(' ')[0] ?? 'Utilizador'}</span>
          </h1>
          <p className="text-gray-400">{format(hoje, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt })}</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-700">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Sistema Operacional</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estatisticas.map((stat, index) => (
          <div key={index} className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-gold-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/5">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                stat.positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Ordens de Serviço</h3>
              <p className="text-sm text-gray-400">{ordensAbertas.length} ordens em aberto</p>
            </div>
            <button className="text-sm text-gold-400 hover:text-gold-300 font-medium">Ver todas</button>
          </div>
          <div className="divide-y divide-gray-700/50">
            {ordensServico.slice(0, 5).map((os) => {
              const badge = getStatusBadge(os.status);
              const viatura = getViaturaInfo(os.viaturaId);
              return (
                <div key={os.id} className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-xl flex items-center justify-center">
                        <Car className="w-5 h-5 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium group-hover:text-gold-400 transition-colors">{os.numero}</p>
                        <p className="text-gray-400 text-sm">{getClienteNome(os.clienteId)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gold-400 font-medium">Kz {os.total.toLocaleString('pt-AO')}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  {viatura && (
                    <p className="mt-2 ml-14 text-gray-500 text-sm">{viatura.marca} {viatura.modelo} • {viatura.matricula}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h3 className="text-lg font-semibold text-white">Agenda de Hoje</h3>
            <p className="text-sm text-gray-400">{format(hoje, "d 'de' MMMM", { locale: pt })}</p>
          </div>
          <div className="p-4 space-y-3">
            {agenda.length > 0 ? agenda.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                <div className="w-14 h-14 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-gold-400 font-bold text-sm">{format(new Date(item.dataInicio), 'HH:mm')}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{item.titulo}</p>
                  <p className="text-gray-400 text-sm capitalize">{item.tipo}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-gray-500">Sem compromissos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Faturas Recentes</h3>
              <p className="text-sm text-gray-400">{faturas.length} faturas</p>
            </div>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {faturas.slice(0, 4).map((fatura) => (
              <div key={fatura.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                <div>
                  <p className="text-white font-medium font-mono">{fatura.numero}</p>
                  <p className="text-gray-400 text-sm">{format(new Date(fatura.dataEmissao), 'dd MMM')}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold-400 font-bold">Kz {fatura.total.toLocaleString('pt-AO')}</p>
                  <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                    fatura.status === 'paga' ? 'bg-emerald-500/20 text-emerald-400' :
                    fatura.status === 'emitida' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {fatura.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Clientes Premium</h3>
              <p className="text-sm text-gray-400">Top {clientes.length} clientes</p>
            </div>
            <Users className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {clientes.slice(0, 4).map((cliente, index) => {
              const clienteViaturas = viaturas.filter(v => v.clienteId === cliente.id);
              return (
                <div key={cliente.id} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                    'bg-gradient-to-br from-gold-500/20 to-gold-600/20'
                  }`}>
                    {cliente.nome[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{cliente.nome}</p>
                    <p className="text-gray-400 text-sm">{clienteViaturas.length} viaturas</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    cliente.tipo === 'empresa' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {cliente.tipo === 'empresa' ? 'Empresa' : 'Particular'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {estoqueBaixo.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm rounded-2xl border border-orange-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-400">Alerta de Stock</h3>
              <p className="text-sm text-gray-400">{estoqueBaixo.length} produtos precisam de reposição</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {estoqueBaixo.slice(0, 3).map((item) => (
              <div key={item.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <p className="text-white font-medium truncate">{item.nome}</p>
                <p className="text-orange-400 text-sm mt-1">
                  Stock: <span className="font-bold">{item.quantidade}</span> / Min: {item.quantidadeMinima}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
