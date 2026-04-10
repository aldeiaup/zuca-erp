import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Send, Paperclip, Smile, Phone, MoreVertical, ChevronDown, MessageCircle } from 'lucide-react';
import type { Conversa, Message } from '../../store';

const STATUS_LABEL: Record<Conversa['status'], string> = {
  ativa:     'Activa',
  pendente:  'Pendente',
  resolvida: 'Resolvida',
  arquivada: 'Arquivada',
};

const STATUS_DOT: Record<Conversa['status'], string> = {
  ativa:     'bg-emerald-500',
  pendente:  'bg-amber-400',
  resolvida: 'bg-[#0081FB]',
  arquivada: 'bg-gray-400',
};

const CANAL_LABEL: Record<Conversa['canal'], { label: string; cls: string }> = {
  whatsapp:  { label: 'WhatsApp', cls: 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30' },
  instagram: { label: 'Instagram', cls: 'bg-purple-500/10 text-purple-500 border border-purple-500/30' },
};

function getInitials(nome: string) {
  return nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

interface Props {
  conversa: Conversa;
  mensagens: Message[];
  onSendMessage: (texto: string) => void;
  onStatusChange: (status: Conversa['status']) => void;
  podeAlterarStatus?: boolean;
}

function MessageBubble({ msg }: { msg: Message }) {
  const isAtendente = msg.remetente === 'atendente';
  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={`flex ${isAtendente ? 'justify-end' : 'justify-start'} mb-1`}
    >
      <div className={`max-w-[72%] ${isAtendente ? 'items-end' : 'items-start'} flex flex-col`}>
        {isAtendente && msg.nomeAtendente && (
          <span className="text-[10px] text-[#0081FB]/70 mb-0.5 px-1">{msg.nomeAtendente}</span>
        )}
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed ${
            isAtendente
              ? 'bg-[#0084FF] text-white rounded-[18px_18px_4px_18px]'
              : 'bg-white text-[#050505] shadow-sm rounded-[18px_18px_18px_4px]'
          }`}
        >
          {msg.texto}
        </div>
        <span className={`text-[10px] mt-0.5 px-1 ${isAtendente ? 'text-[#65676B]' : 'text-[#65676B]'}`}>
          {format(new Date(msg.timestamp), 'HH:mm', { locale: pt })}
        </span>
      </div>
    </motion.div>
  );
}

export default function ChatArea({ conversa, mensagens, onSendMessage, onStatusChange, podeAlterarStatus = true }: Props) {
  const [texto, setTexto] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleSend = () => {
    if (!texto.trim()) return;
    onSendMessage(texto.trim());
    setTexto('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canalInfo = CANAL_LABEL[conversa.canal];

  return (
    <div className="flex flex-col h-full bg-[#F0F2F5]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-[#E4E6EB] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#0081FB] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">{getInitials(conversa.clienteNome)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[#050505]">{conversa.clienteNome}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${canalInfo.cls}`}>
                {canalInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[conversa.status]}`} />
              <p className="text-xs text-[#65676B]">{conversa.clienteTelefone}</p>
            </div>
          </div>
        </div>

        {/* Acções */}
        <div className="flex items-center gap-1">
          {/* Status dropdown — apenas para quem tem permissão */}
          <div className="relative">
            <button
              onClick={() => podeAlterarStatus && setShowStatusMenu((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F0F2F5] text-xs font-semibold text-[#050505] transition-colors ${podeAlterarStatus ? 'hover:bg-[#E4E6EB] cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
              title={podeAlterarStatus ? 'Alterar estado' : 'Sem permissão para alterar estado'}
            >
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[conversa.status]}`} />
              {STATUS_LABEL[conversa.status]}
              <ChevronDown className="w-3 h-3 text-[#65676B]" />
            </button>
            <AnimatePresence>
              {showStatusMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-full mt-1 bg-white border border-[#E4E6EB] rounded-xl shadow-lg z-10 min-w-[140px] overflow-hidden"
                >
                  {(Object.keys(STATUS_LABEL) as Conversa['status'][]).map((s) => (
                    <button
                      key={s}
                      onClick={() => { onStatusChange(s); setShowStatusMenu(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-[#F0F2F5] transition-colors ${
                        conversa.status === s ? 'font-semibold text-[#0081FB]' : 'text-[#050505]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="p-2 hover:bg-[#F0F2F5] rounded-full text-[#65676B] transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-[#F0F2F5] rounded-full text-[#65676B] transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {mensagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-12 h-12 bg-[#E4E6EB] rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[#65676B]" />
            </div>
            <p className="text-sm text-[#65676B]">Nenhuma mensagem ainda</p>
            <p className="text-xs text-[#65676B]">Inicie a conversa com {conversa.clienteNome}</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {mensagens.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-[#E4E6EB]">
        <div className="flex items-end gap-2 bg-[#F0F2F5] rounded-2xl px-4 py-2">
          <button className="p-1.5 text-[#65676B] hover:text-[#050505] transition-colors flex-shrink-0">
            <Smile className="w-5 h-5" />
          </button>
          <textarea
            ref={textareaRef}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Mensagem para ${conversa.clienteNome}…`}
            rows={1}
            style={{ resize: 'none' }}
            className="flex-1 bg-transparent text-sm text-[#050505] placeholder-[#65676B] outline-none py-1 max-h-32 overflow-y-auto"
          />
          <div className="flex items-center gap-1 flex-shrink-0">
            <button className="p-1.5 text-[#65676B] hover:text-[#050505] transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!texto.trim()}
              className={`p-2 rounded-full transition-all ${
                texto.trim()
                  ? 'bg-[#0081FB] text-white hover:bg-[#0066CC]'
                  : 'bg-[#E4E6EB] text-[#BCC0C4] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[#65676B] text-center mt-1.5">
          Enter para enviar · Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}
