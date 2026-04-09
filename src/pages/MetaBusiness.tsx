import { useState, useRef, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useStore } from '../store';
import type { Conversa } from '../store';
import {
  MessageCircle, Send, Search, Check, CheckCheck, Archive,
  Settings, Sparkles, Copy, X, RotateCcw, Bot,
  Eye, EyeOff, Wifi, WifiOff, ExternalLink, AlertTriangle,
  Key, Shield, Zap, RefreshCw
} from 'lucide-react';

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const GeminiIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24Z" />
  </svg>
);

function generateGeminiSuggestions(text: string, nome: string): { title: string; text: string }[] {
  const content = text.toLowerCase();
  if (content.includes('agendar') || content.includes('marcar') || content.includes('disponibilidade')) {
    return [
      { title: 'Sugerir Horários', text: `Olá, ${nome}! Temos disponibilidade para amanhã às 10h ou quinta-feira às 14h. Qual destes horários prefere para agendarmos o seu serviço?` },
      { title: 'Solicitar Mais Detalhes', text: `Bom dia, ${nome}! Para validarmos o melhor horário, pode indicar-me qual é a sua viatura e o tipo de serviço que pretende realizar?` },
    ];
  }
  if (content.includes('preço') || content.includes('quanto custa') || content.includes('orçamento')) {
    return [
      { title: 'Orçamento Base (Revisão)', text: `O preço base para uma revisão standard começa nos Kz 45.000 (óleo e filtros). No entanto, o valor exato depende da marca e modelo da sua viatura. Posso preparar um orçamento detalhado se me fornecer os dados do veículo?` },
      { title: 'Convidar para Diagnóstico', text: `Olá ${nome}! A nossa equipa recomenda sempre que passe pelo nosso centro para um diagnóstico gratuito, garantindo assim um orçamento 100% preciso para o problema da viatura.` },
    ];
  }
  return [
    { title: 'Saudação Profissional', text: `Olá, ${nome}! Bem-vindo à Zuca Motors. Como a nossa equipa pode ajudá-lo(a) hoje?` },
    { title: 'Aviso de Espera', text: `Agradecemos a sua mensagem, ${nome}. Estamos a avaliar a sua questão e já respondemos com os detalhes nos próximos minutos.` },
  ];
}

// ─── Token Input com show/hide e copy ────────────────────────────────────────
function TokenInput({
  label, value, placeholder, onChange, hint
}: { label: string; value: string; placeholder: string; onChange: (v: string) => void; hint?: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copiado para a área de transferência');
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-gold-500 pr-10 font-mono"
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          className="p-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ─── Status Indicator ─────────────────────────────────────────────────────────
function ConnectionBadge({ status }: { status: 'connected' | 'disconnected' | 'testing' | 'unconfigured' }) {
  const map = {
    connected:    { icon: Wifi,      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Conectado' },
    disconnected: { icon: WifiOff,   color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',         label: 'Erro de Ligação' },
    testing:      { icon: RefreshCw, color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     label: 'A testar…' },
    unconfigured: { icon: AlertTriangle, color: 'text-gray-400', bg: 'bg-gray-700/50 border-gray-600',         label: 'Não configurado' },
  };
  const { icon: Icon, color, bg, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${bg} ${color}`}>
      <Icon className={`w-3 h-3 ${status === 'testing' ? 'animate-spin' : ''}`} />
      {label}
    </span>
  );
}

export default function MetaBusiness() {
  const store = useStore();
  const config = store?.config || {};
  const meta = (config as any)?.meta || {};

  const [selectedConversa, setSelectedConversa] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'instagram' | 'webhook'>('whatsapp');
  const [testStatus, setTestStatus] = useState<Record<string, 'connected' | 'disconnected' | 'testing' | 'unconfigured'>>({
    whatsapp: meta.whatsappToken ? 'connected' : 'unconfigured',
    instagram: meta.instagramToken ? 'connected' : 'unconfigured',
  });

  const [configForm, setConfigForm] = useState({
    whatsappToken: meta.whatsappToken || '',
    whatsappPhoneId: meta.whatsappPhoneId || '',
    whatsappBusinessId: meta.whatsappBusinessId || '',
    instagramToken: meta.instagramToken || '',
    instagramBusinessId: meta.instagramBusinessId || '',
    verifyToken: meta.verifyToken || '',
  });

  const [searchTerm, setSearchTerm]       = useState('');
  const [canalFilter, setCanalFilter]     = useState<'todos' | 'whatsapp' | 'instagram'>('todos');
  const [newMessage, setNewMessage]       = useState('');
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (meta && Object.keys(meta).length > 0) {
      setConfigForm({
        whatsappToken:      meta.whatsappToken || '',
        whatsappPhoneId:    meta.whatsappPhoneId || '',
        whatsappBusinessId: meta.whatsappBusinessId || '',
        instagramToken:     meta.instagramToken || '',
        instagramBusinessId:meta.instagramBusinessId || '',
        verifyToken:        meta.verifyToken || '',
      });
      setTestStatus({
        whatsapp:  meta.whatsappToken  ? 'connected' : 'unconfigured',
        instagram: meta.instagramToken ? 'connected' : 'unconfigured',
      });
    }
  }, []);

  const handleTestConnection = (canal: 'whatsapp' | 'instagram') => {
    const token = canal === 'whatsapp' ? configForm.whatsappToken : configForm.instagramToken;
    if (!token) {
      toast.error(`Token ${canal === 'whatsapp' ? 'WhatsApp' : 'Instagram'} não configurado`);
      return;
    }
    setTestStatus(s => ({ ...s, [canal]: 'testing' }));
    // Simula teste de API (em produção seria um fetch real)
    setTimeout(() => {
      const ok = token.length > 10;
      setTestStatus(s => ({ ...s, [canal]: ok ? 'connected' : 'disconnected' }));
      if (ok) toast.success(`${canal === 'whatsapp' ? 'WhatsApp' : 'Instagram'} conectado com sucesso!`);
      else toast.error(`Falha na ligação: token inválido ou sem permissões`);
    }, 1800);
  };

  const handleSaveConfig = () => {
    if (store.updateConfig) {
      store.updateConfig({ meta: configForm } as any);
      toast.success('Configurações Meta guardadas!');
      setTestStatus({
        whatsapp:  configForm.whatsappToken  ? 'connected' : 'unconfigured',
        instagram: configForm.instagramToken ? 'connected' : 'unconfigured',
      });
    }
    setShowConfigModal(false);
  };

  const conversas = store.conversas || [];

  const filteredConversas = useMemo(() => {
    return conversas.filter((c: Conversa) => {
      const matchSearch = c.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.ultimaMensagem?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCanal = canalFilter === 'todos' || c.canal === canalFilter;
      return matchSearch && matchCanal && c.status !== 'arquivada';
    }).sort((a: Conversa, b: Conversa) => {
      return new Date(b.ultimaHora).getTime() - new Date(a.ultimaHora).getTime();
    });
  }, [conversas, searchTerm, canalFilter]);

  useEffect(() => {
    if (!selectedConversa && filteredConversas.length > 0) {
      setSelectedConversa(filteredConversas[0].id);
    }
  }, [filteredConversas, selectedConversa]);

  const conversaSelecionada = selectedConversa ? conversas.find((c: Conversa) => c.id === selectedConversa) : null;
  const mensagensConversa   = selectedConversa ? (store.mensagens?.[selectedConversa] || []) : [];

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversa) return;
    if (store.sendMessage) {
      store.sendMessage(selectedConversa, newMessage, 'atendente', 'Admin');
    }
    setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagensConversa]);

  const aiSuggestions = useMemo(() => {
    if (!conversaSelecionada) return [];
    return generateGeminiSuggestions(
      conversaSelecionada.ultimaMensagem,
      conversaSelecionada.clienteNome.split(' ')[0]
    );
  }, [conversaSelecionada, mensagensConversa.length]);

  const webhookUrl = `${window.location.origin}/api/webhook/meta`;

  // Indicador global de ligação no header
  const globalStatus: 'connected' | 'unconfigured' =
    (meta.whatsappToken || meta.instagramToken) ? 'connected' : 'unconfigured';

  return (
    <div className="space-y-6 h-[calc(100vh-7rem)] overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Meta Business
            <ConnectionBadge status={globalStatus} />
          </h1>
          <p className="text-gray-400">Inbox unificado · WhatsApp + Instagram · Gemini AI</p>
        </div>
        <button
          onClick={() => setShowConfigModal(true)}
          className="px-4 py-2.5 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-600"
        >
          <Settings className="w-4 h-4" /> Configurar API Meta
        </button>
      </div>

      {/* Main 3-column layout */}
      <div className="flex gap-4 h-[calc(100%-6rem)]">
        {/* Left — Inbox */}
        <div className="flex-[3] max-w-sm bg-gray-800/50 rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden shadow-lg backdrop-blur-sm">
          <div className="p-4 border-b border-gray-700/50 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Pesquisar…" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500" />
            </div>
            <div className="flex gap-2">
              {(['todos', 'whatsapp', 'instagram'] as const).map(f => (
                <button key={f} onClick={() => setCanalFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border flex items-center justify-center gap-1 ${
                    canalFilter === f
                      ? f === 'todos' ? 'bg-gray-700 text-white border-gray-600'
                        : f === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                      : 'bg-gray-900 text-gray-500 border-transparent hover:bg-gray-800'
                  }`}>
                  {f === 'whatsapp' && <WhatsAppIcon className="w-3 h-3" />}
                  {f === 'instagram' && <InstagramIcon className="w-3 h-3" />}
                  {f === 'todos' ? 'Todos' : f === 'whatsapp' ? 'WA' : 'IG'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversas.length === 0
              ? <div className="flex items-center justify-center h-full text-sm text-gray-500">Nenhuma conversa</div>
              : filteredConversas.map((c: Conversa) => (
                <div key={c.id} onClick={() => setSelectedConversa(c.id)}
                  className={`p-4 border-b border-gray-700/30 cursor-pointer flex gap-3 transition-colors ${selectedConversa === c.id ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-lg border border-gray-700">
                      {c.clienteNome.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-800 ${c.canal === 'whatsapp' ? 'bg-emerald-500' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}>
                      {c.canal === 'whatsapp' ? <WhatsAppIcon className="w-3 h-3 text-white" /> : <InstagramIcon className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-sm text-gray-200 truncate">{c.clienteNome}</span>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">{format(new Date(c.ultimaHora), 'HH:mm')}</span>
                    </div>
                    <div className="flex justify-between items-center relative">
                      <p className={`text-xs truncate w-full pr-6 ${c.naoLidas > 0 ? 'text-gray-300 font-bold' : 'text-gray-500'}`}>{c.ultimaMensagem}</p>
                      {c.naoLidas > 0 && (
                        <span className="absolute right-0 w-4 h-4 bg-gold-500 rounded-full text-[9px] font-bold text-gray-900 flex items-center justify-center">{c.naoLidas}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Center — Chat */}
        <div className="flex-[6] bg-gray-800/50 rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden shadow-lg backdrop-blur-sm">
          {conversaSelecionada ? (
            <>
              <div className="p-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center text-white font-bold">
                    {conversaSelecionada.clienteNome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{conversaSelecionada.clienteNome}</h3>
                    <div className="flex gap-2 items-center text-xs">
                      <span className={`flex items-center gap-1 ${conversaSelecionada.canal === 'whatsapp' ? 'text-emerald-400' : 'text-pink-400'}`}>
                        {conversaSelecionada.canal === 'whatsapp' ? <WhatsAppIcon className="w-3 h-3" /> : <InstagramIcon className="w-3 h-3" />}
                        {conversaSelecionada.canal === 'whatsapp' ? 'WhatsApp' : 'Instagram'}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400">{conversaSelecionada.clienteTelefone}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"><Archive className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 border-t border-gray-700/50" />
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Hoje</span>
                  <div className="flex-1 border-t border-gray-700/50" />
                </div>
                {mensagensConversa.map((m: any) => (
                  <div key={m.id} className={`flex ${m.remetente === 'atendente' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm shadow-md ${m.remetente === 'atendente' ? 'bg-gradient-to-tr from-gold-600 to-gold-500 text-white rounded-br-sm' : 'bg-gray-700 border border-gray-600/50 text-gray-100 rounded-bl-sm'}`}>
                      <p className="whitespace-pre-wrap">{m.texto}</p>
                      <div className={`flex items-center mt-1.5 gap-1 ${m.remetente === 'atendente' ? 'justify-end opacity-70' : 'justify-start text-gray-400'}`}>
                        <span className="text-[10px]">{format(new Date(m.timestamp), 'HH:mm')}</span>
                        {m.remetente === 'atendente' && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-700/50 bg-gray-900/30">
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Responda ao cliente…"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-gold-500 transition-colors" />
                  <button onClick={handleSendMessage} disabled={!newMessage.trim()}
                    className={`p-3 rounded-xl flex items-center justify-center transition-all ${newMessage.trim() ? 'bg-gold-500 text-white hover:scale-105' : 'bg-gray-700 text-gray-500'}`}>
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 opacity-50">
              <MessageCircle className="w-16 h-16 mb-4 text-gray-600" />
              <p>Seleccione uma conversa</p>
            </div>
          )}
        </div>

        {/* Right — Gemini AI */}
        <div className="flex-[3] max-w-sm bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700/50 flex flex-col overflow-hidden shadow-lg backdrop-blur-xl relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />

          <div className="p-5 border-b border-gray-700/50 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <GeminiIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Gemini AI</h4>
                <p className="text-[10px] text-gray-400">Sugestões automáticas</p>
              </div>
            </div>
            <button onClick={() => { setIsLoadingSuggestion(true); setTimeout(() => setIsLoadingSuggestion(false), 800); }}
              className={`p-2 text-gray-400 hover:text-white rounded-lg transition-all ${isLoadingSuggestion ? 'animate-spin opacity-50' : 'hover:rotate-180 hover:bg-gray-700'}`}>
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 relative z-10">
            {conversaSelecionada ? (
              isLoadingSuggestion ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700/50 animate-pulse">
                      <div className="h-4 w-1/2 bg-gray-700 rounded mb-4" />
                      <div className="h-3 w-full bg-gray-700 rounded mb-2" />
                      <div className="h-3 w-4/5 bg-gray-700 rounded mb-4" />
                      <div className="h-8 w-full bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[12px] text-gray-400 leading-relaxed">Com base na última mensagem, sugiro:</p>
                  {aiSuggestions.map((s, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <h5 className="text-xs font-bold text-gray-300 mb-2 flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" /> {s.title}
                      </h5>
                      <p className="text-sm text-gray-400 leading-relaxed italic mb-4">"{s.text}"</p>
                      <button onClick={() => setNewMessage(s.text)}
                        className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
                        <Zap className="w-3 h-3" /> Usar Sugestão
                      </button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-purple-400" />
                </div>
                <h5 className="text-white font-bold mb-2">Pronto para Ajudar</h5>
                <p className="text-xs text-gray-500 max-w-[200px]">Seleccione uma conversa para o Gemini sugerir respostas.</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-900 border-t border-gray-800 text-center relative z-10">
            <p className="text-[10px] text-gray-500">Sugestões baseadas no contexto da Zuca Motors.</p>
          </div>
        </div>
      </div>

      {/* ═══ MODAL CONFIGURAR API META ═══════════════════════════════════════ */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-3xl w-full max-w-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header do Modal */}
            <div className="px-8 pt-7 pb-5 border-b border-gray-700 flex items-center justify-between bg-gray-900/40">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  Configurar API Meta Business
                </h3>
                <p className="text-gray-400 text-sm mt-1">Integração WhatsApp Business + Instagram Direct</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 px-8 bg-gray-900/20">
              {([
                { id: 'whatsapp',  icon: WhatsAppIcon,   label: 'WhatsApp' },
                { id: 'instagram', icon: InstagramIcon,  label: 'Instagram' },
                { id: 'webhook',   icon: Key,            label: 'Webhook' },
              ] as const).map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-5 py-3.5 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-gold-500 text-gold-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id !== 'webhook' && (
                    <ConnectionBadge status={testStatus[tab.id as 'whatsapp' | 'instagram']} />
                  )}
                </button>
              ))}
            </div>

            {/* Conteúdo da Tab */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

              {/* ── WhatsApp ── */}
              {activeTab === 'whatsapp' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WhatsAppIcon className="w-5 h-5 text-emerald-400" />
                      <h4 className="font-bold text-white">WhatsApp Business API</h4>
                    </div>
                    <ConnectionBadge status={testStatus.whatsapp} />
                  </div>

                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-xs text-blue-300 space-y-1">
                    <p className="font-bold flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Como obter as credenciais:</p>
                    <p>1. Aceda a <span className="font-mono text-blue-200">developers.facebook.com</span></p>
                    <p>2. Crie uma App → WhatsApp → Business Platform</p>
                    <p>3. Copie o <strong>Phone Number ID</strong> e o <strong>Access Token</strong></p>
                  </div>

                  <TokenInput label="Phone Number ID" value={configForm.whatsappPhoneId}
                    placeholder="Ex: 123456789012345"
                    hint="ID do número de telefone no Meta Business Manager"
                    onChange={v => setConfigForm(f => ({ ...f, whatsappPhoneId: v }))} />

                  <TokenInput label="WhatsApp Business Account ID" value={configForm.whatsappBusinessId}
                    placeholder="Ex: 987654321098765"
                    hint="ID da conta WhatsApp Business"
                    onChange={v => setConfigForm(f => ({ ...f, whatsappBusinessId: v }))} />

                  <TokenInput label="Access Token (Meta)" value={configForm.whatsappToken}
                    placeholder="EAAxxxxxxxxxxxxxxxx…"
                    hint="Token de acesso permanente com permissões WhatsApp"
                    onChange={v => setConfigForm(f => ({ ...f, whatsappToken: v }))} />

                  <button onClick={() => handleTestConnection('whatsapp')}
                    disabled={testStatus.whatsapp === 'testing' || !configForm.whatsappToken}
                    className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                    {testStatus.whatsapp === 'testing'
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> A testar ligação…</>
                      : <><Wifi className="w-4 h-4" /> Testar Ligação WhatsApp</>}
                  </button>
                </div>
              )}

              {/* ── Instagram ── */}
              {activeTab === 'instagram' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <InstagramIcon className="w-5 h-5 text-pink-400" />
                      <h4 className="font-bold text-white">Instagram Direct API</h4>
                    </div>
                    <ConnectionBadge status={testStatus.instagram} />
                  </div>

                  <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4 text-xs text-pink-300 space-y-1">
                    <p className="font-bold flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Como obter as credenciais:</p>
                    <p>1. Ligue a conta Instagram ao Meta Business Manager</p>
                    <p>2. Ative o produto <strong>Instagram Messaging</strong> na App</p>
                    <p>3. Copie o <strong>Instagram Business Account ID</strong> e o token</p>
                  </div>

                  <TokenInput label="Instagram Business Account ID" value={configForm.instagramBusinessId}
                    placeholder="Ex: 17841400000000000"
                    hint="ID da conta Instagram Business"
                    onChange={v => setConfigForm(f => ({ ...f, instagramBusinessId: v }))} />

                  <TokenInput label="Access Token (Instagram)" value={configForm.instagramToken}
                    placeholder="IGQVxxxx…"
                    hint="Token com permissão instagram_manage_messages"
                    onChange={v => setConfigForm(f => ({ ...f, instagramToken: v }))} />

                  <button onClick={() => handleTestConnection('instagram')}
                    disabled={testStatus.instagram === 'testing' || !configForm.instagramToken}
                    className="w-full py-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/30 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                    {testStatus.instagram === 'testing'
                      ? <><RefreshCw className="w-4 h-4 animate-spin" /> A testar ligação…</>
                      : <><InstagramIcon className="w-4 h-4" /> Testar Ligação Instagram</>}
                  </button>
                </div>
              )}

              {/* ── Webhook ── */}
              {activeTab === 'webhook' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-white">Webhook Configuration</h4>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300 space-y-1">
                    <p className="font-bold">Como configurar o Webhook no Meta:</p>
                    <p>1. Na App Meta → Produtos → Webhooks</p>
                    <p>2. Cole o URL abaixo no campo <strong>Callback URL</strong></p>
                    <p>3. Cole o Verify Token no campo <strong>Verify Token</strong></p>
                    <p>4. Subscreva os eventos: <code className="bg-amber-900/30 px-1 rounded">messages</code>, <code className="bg-amber-900/30 px-1 rounded">messaging_postbacks</code></p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Webhook URL</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-emerald-400 text-sm font-mono truncate">
                        {webhookUrl}
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success('URL copiado!'); }}
                        className="p-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <TokenInput label="Verify Token" value={configForm.verifyToken}
                    placeholder="Ex: ZUCA_WEBHOOK_SECRET_2024"
                    hint="Token secreto que o Meta enviará para validar o webhook"
                    onChange={v => setConfigForm(f => ({ ...f, verifyToken: v }))} />

                  <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase">Eventos Subscritos</p>
                    {['messages', 'messaging_postbacks', 'message_deliveries', 'message_reads'].map(e => (
                      <div key={e} className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <code className="font-mono">{e}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-gray-700 bg-gray-900/30 flex gap-3">
              <button onClick={() => setShowConfigModal(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors">
                Cancelar
              </button>
              <button onClick={handleSaveConfig}
                className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" /> Guardar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
