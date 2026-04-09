import { useState } from 'react';
import { X, Sparkles, Wrench, Bug, Zap, Shield, Star } from 'lucide-react';

interface ChangelogEntry {
  type: 'feature' | 'fix' | 'improvement' | 'security' | 'breaking';
  text: string;
}

interface Version {
  version: string;
  date: string;
  label?: string;
  labelColor?: string;
  summary: string;
  changes: ChangelogEntry[];
}

const VERSIONS: Version[] = [
  {
    version: '1.4.0',
    date: '08/04/2026',
    label: 'Latest',
    labelColor: 'bg-gold-500/20 text-gold-400 border-gold-500/30',
    summary: 'Integração Meta Business API + Toast Notifications + Melhorias globais',
    changes: [
      { type: 'feature', text: 'MetaBusiness: modal de configuração API com 3 tabs (WhatsApp, Instagram, Webhook)' },
      { type: 'feature', text: 'MetaBusiness: tokens com show/hide, copiar e teste de ligação em tempo real' },
      { type: 'feature', text: 'MetaBusiness: indicadores de status de conexão por plataforma' },
      { type: 'feature', text: 'Sistema de Toast Notifications global (sonner) em todos os módulos' },
      { type: 'feature', text: 'Ordens de Serviço: campo Viatura filtrado automaticamente pelo cliente' },
      { type: 'feature', text: 'Ordens de Serviço: atribuição de Técnico Responsável' },
      { type: 'feature', text: 'Ordens de Serviço: campos de Data de Entrada e Data Prevista' },
      { type: 'improvement', text: 'Faturas: IVA dinâmico lido das Configurações Fiscais' },
      { type: 'improvement', text: 'Faturas: numeração sequencial por série (ex: FT260001) em vez de timestamp' },
      { type: 'fix', text: 'MetaBusiness: tela branca corrigida — propriedade conversas adicionada ao store' },
      { type: 'fix', text: 'Dashboard: acesso reactivo ao user via hook (era useStore.getState())' },
      { type: 'fix', text: 'Login: intervalo de fundo corrigido de useState para useEffect' },
    ],
  },
  {
    version: '1.3.0',
    date: '07/04/2026',
    summary: 'CRUD completo em todos os módulos operacionais',
    changes: [
      { type: 'feature', text: 'Viaturas: modal de adicionar/editar com todos os campos e confirmação de eliminação' },
      { type: 'feature', text: 'Ordens de Serviço: modal de criar/editar e fluxo de status visual' },
      { type: 'feature', text: 'Faturas: modal completo com cálculo de IVA em tempo real e visualização fiscal' },
      { type: 'feature', text: 'Estoque: modal de produto com margem de lucro em tempo real' },
      { type: 'feature', text: 'Funcionários: modal com cálculo INSS/IRT automático, soft-delete' },
      { type: 'feature', text: 'Agenda: calendário semanal com clique para adicionar em slots livres' },
      { type: 'improvement', text: 'Store: adicionadas acções CRUD para Viaturas, Estoque, Agenda e Funcionários' },
      { type: 'fix', text: 'Corrigidos erros TS1484 (import type) em 6 módulos' },
    ],
  },
  {
    version: '1.2.0',
    date: '06/04/2026',
    summary: 'Módulo Financeiro expandido e Multi-moeda',
    changes: [
      { type: 'feature', text: 'Financeiro: gestão de Caixas e Contas Bancárias (Benfica + Alvalade)' },
      { type: 'feature', text: 'Financeiro: folha de pagamento com cálculo IRT/INSS automático' },
      { type: 'feature', text: 'Financeiro: adiantamentos com desconto automático na folha' },
      { type: 'feature', text: 'Multi-moeda: suporte AOA, USD, EUR com taxas de câmbio configuráveis' },
      { type: 'feature', text: 'Financeiro: gestão de fornecedores e transacções' },
      { type: 'improvement', text: 'Store: adicionadas interfaces Transacao, CaixaConta, FolhaPagamento, Adiantamento' },
    ],
  },
  {
    version: '1.1.0',
    date: '05/04/2026',
    summary: 'Módulo Meta Business e estrutura de comunicação',
    changes: [
      { type: 'feature', text: 'MetaBusiness: inbox unificado WhatsApp + Instagram Direct' },
      { type: 'feature', text: 'MetaBusiness: Gemini AI Assistant com sugestões contextuais' },
      { type: 'feature', text: 'MetaBusiness: filtros por canal, pesquisa e arquivo de conversas' },
      { type: 'feature', text: 'Store: tipos Conversa, Message e acções sendMessage, togglePinConversa' },
      { type: 'improvement', text: 'Layout: badge de notificação animado no Meta Business' },
    ],
  },
  {
    version: '1.0.0',
    date: '03/04/2026',
    label: 'Initial Release',
    labelColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    summary: 'Lançamento inicial do ZucaMotors ERP',
    changes: [
      { type: 'feature', text: 'Dashboard com KPIs: ordens abertas, receita mensal, alertas de estoque' },
      { type: 'feature', text: 'Módulo Clientes com perfil, viaturas associadas e histórico' },
      { type: 'feature', text: 'Módulo Viaturas com ficha técnica completa' },
      { type: 'feature', text: 'Módulo Ordens de Serviço com fluxo de estados' },
      { type: 'feature', text: 'Módulo Faturas com emissão e controlo de IVA (14%)' },
      { type: 'feature', text: 'Módulo Estoque com alertas de quantidade mínima' },
      { type: 'feature', text: 'Módulo Agenda com calendário semanal' },
      { type: 'feature', text: 'Autenticação com roles: master, admin, gerente, funcionário' },
      { type: 'feature', text: 'Layout responsivo com sidebar colapsável' },
      { type: 'feature', text: 'Configurações de empresa, fiscal e sistema' },
      { type: 'security', text: 'Rotas protegidas com ProtectedRoute + AuthContext' },
    ],
  },
];

const typeConfig = {
  feature:     { icon: Sparkles, color: 'text-blue-400',    bg: 'bg-blue-500/10',    label: 'Novo' },
  improvement: { icon: Zap,      color: 'text-amber-400',   bg: 'bg-amber-500/10',   label: 'Melhoria' },
  fix:         { icon: Bug,      color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Correcção' },
  security:    { icon: Shield,   color: 'text-purple-400',  bg: 'bg-purple-500/10',  label: 'Segurança' },
  breaking:    { icon: Wrench,   color: 'text-red-400',     bg: 'bg-red-500/10',     label: 'Breaking' },
};

interface Props {
  onClose: () => void;
}

export default function ChangelogModal({ onClose }: Props) {
  const [selected, setSelected] = useState(VERSIONS[0].version);
  const version = VERSIONS.find(v => v.version === selected) || VERSIONS[0];

  const grouped = version.changes.reduce<Record<string, ChangelogEntry[]>>((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type].push(c);
    return acc;
  }, {});

  const typeOrder: (keyof typeof typeConfig)[] = ['feature', 'improvement', 'fix', 'security', 'breaking'];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-3xl w-full max-w-3xl border border-gray-700 shadow-2xl overflow-hidden flex max-h-[88vh]">

        {/* Sidebar de versões */}
        <div className="w-52 flex-shrink-0 bg-gray-900/60 border-r border-gray-700 flex flex-col">
          <div className="p-5 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-bold text-gold-400 uppercase tracking-widest">Changelog</span>
            </div>
            <p className="text-[11px] text-gray-500">Histórico de versões</p>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {VERSIONS.map(v => (
              <button
                key={v.version}
                onClick={() => setSelected(v.version)}
                className={`w-full text-left px-4 py-3 transition-all border-l-2 ${
                  selected === v.version
                    ? 'bg-gray-800 border-gold-500'
                    : 'border-transparent hover:bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-bold ${selected === v.version ? 'text-white' : 'text-gray-300'}`}>
                    v{v.version}
                  </span>
                  {v.label && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${v.labelColor}`}>
                      {v.label}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">{v.date}</p>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-700">
            <p className="text-[10px] text-gray-600 text-center">ZucaMotors ERP<br/>© 2026</p>
          </div>
        </div>

        {/* Conteúdo da versão */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-7 pt-6 pb-5 border-b border-gray-700 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">v{version.version}</h2>
                {version.label && (
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${version.labelColor}`}>
                    {version.label}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">{version.summary}</p>
              <p className="text-gray-600 text-xs mt-2">{version.date}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors ml-4 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats rápidas */}
          <div className="px-7 py-4 border-b border-gray-700/50 flex gap-4">
            {(Object.keys(typeConfig) as (keyof typeof typeConfig)[])
              .filter(t => grouped[t]?.length)
              .map(t => {
                const { icon: Icon, color, bg, label } = typeConfig[t];
                return (
                  <div key={t} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className={`text-xs font-bold ${color}`}>{grouped[t].length} {label}{grouped[t].length > 1 ? 's' : ''}</span>
                  </div>
                );
              })}
          </div>

          {/* Lista de mudanças */}
          <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
            {typeOrder.filter(t => grouped[t]?.length).map(type => {
              const { icon: Icon, color, bg, label } = typeConfig[type];
              return (
                <div key={type}>
                  <div className={`flex items-center gap-2 mb-3`}>
                    <div className={`p-1.5 rounded-lg ${bg}`}>
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                    </div>
                    <h4 className={`text-xs font-bold uppercase tracking-wider ${color}`}>{label}s</h4>
                    <div className="flex-1 border-t border-gray-700/50" />
                    <span className={`text-xs px-2 py-0.5 rounded-full ${bg} ${color} font-bold`}>{grouped[type].length}</span>
                  </div>
                  <ul className="space-y-2">
                    {grouped[type].map((entry, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300 group">
                        <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${color.replace('text-', 'bg-')}`} />
                        <span className="leading-relaxed group-hover:text-white transition-colors">{entry.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-7 py-4 border-t border-gray-700 bg-gray-900/30 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {version.changes.length} alterações nesta versão
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl text-sm font-bold transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
