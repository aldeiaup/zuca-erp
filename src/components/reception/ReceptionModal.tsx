import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MessageCircle, LayoutGrid, Users, Send, Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useReception } from '../../hooks/useReception';
import type { ChatInterno, ChatInternoMensagem } from '../../store';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import ReceptionKanban from './ReceptionKanban';

const SETORES = [
  { id: 'chat geral', label: 'Geral', icon: Hash },
  { id: 'chat recepcao', label: 'Recepção', icon: Users },
  { id: 'chat oficina', label: 'Oficina', icon: Users },
  { id: 'chat financeiro', label: 'Financeiro', icon: Users },
];

function ChatInternoArea({
  chat,
  mensagens,
  onSendMessage,
}: {
  chat: ChatInterno;
  mensagens: ChatInternoMensagem[];
  onSendMessage: (texto: string) => void;
}) {
  const [texto, setTexto] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleSend = () => {
    if (texto.trim()) {
      onSendMessage(texto.trim());
      setTexto('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageStyle = (remetente: string) => {
    if (remetente === 'atendente') return 'bg-gold-500 text-white rounded-br-md';
    if (remetente === 'sistema') return 'bg-gray-700 text-gray-400 text-center w-full';
    return 'bg-gray-700 text-white rounded-bl-md';
  };

  const getAlignment = (remetente: string) => {
    if (remetente === 'atendente') return 'items-end';
    return 'items-start';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header do chat */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-800/60">
        <div className="flex items-center gap-2">
          {chat.tipo === 'geral' ? (
            <Hash className="w-4 h-4 text-gold-400" />
          ) : (
            <Users className="w-4 h-4 text-gold-400" />
          )}
          <span className="font-semibold text-white text-sm">{chat.titulo}</span>
          {chat.setor && (
            <span className="text-[10px] text-gray-500 uppercase">· {chat.setor}</span>
          )}
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {mensagens.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${getAlignment(msg.remetente)}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${getMessageStyle(msg.remetente)}`}>
                {msg.remetente === 'sistema' ? (
                  <p className="text-xs">{msg.texto}</p>
                ) : (
                  <>
                    {msg.remetente === 'atendente' && msg.nomeAtendente && (
                      <p className="text-[10px] font-bold opacity-70 mb-1">{msg.nomeAtendente}</p>
                    )}
                    <p className="text-sm">{msg.texto}</p>
                  </>
                )}
              </div>
              <span className="text-[10px] text-gray-600 mt-1 px-1">
                {format(new Date(msg.timestamp), 'HH:mm', { locale: pt })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/40">
        <div className="flex gap-2">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escrever mensagem..."
            className="flex-1 bg-gray-700/60 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-gold-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!texto.trim()}
            className="p-2.5 bg-gold-500 hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceptionModalContent() {
  const reception = useReception();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'chat' | 'tarefas'>('chat');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') reception.closeReception();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reception]);

  const handleBackToDashboard = () => {
    reception.closeReception();
    navigate('/dashboard');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-[100] bg-gray-900 flex flex-col"
    >
      {/* Header */}
      <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-gray-400 hover:bg-gray-700 hover:text-white transition-colors group"
            title="Voltar ao Dashboard"
          >
            <LayoutGrid className="w-4 h-4 group-hover:text-gold-400 transition-colors" />
            <span className="text-xs font-semibold hidden sm:block">Dashboard</span>
          </button>
          <div className="w-px h-5 bg-gray-700" />
          <img
            src="/images/logotipo.png"
            alt="ZucaMotors"
            className="w-7 h-7 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-sm font-bold text-white">Recepção</span>
        </div>
        <div className="flex items-center gap-2">
          {reception.user && (
            <div className="hidden md:flex items-center gap-2 pr-3 border-r border-gray-700">
              <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {reception.user.nome.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <span className="text-xs font-medium text-white">{reception.user.nome.split(' ')[0]}</span>
            </div>
          )}
          <button
            onClick={reception.closeReception}
            className="p-2 hover:bg-gray-700 rounded-full text-gray-400 hover:text-white transition-colors"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de chats/setores */}
        <aside className="w-[280px] bg-gray-800/80 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Canais</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {SETORES.map((setor) => (
              <button
                key={setor.id}
                onClick={() => reception.seleccionarChat(setor.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  reception.chatActivoId === setor.id
                    ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <setor.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{setor.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-gold-500 text-gold-400'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Chat Interno</span>
            </button>
            <button
              onClick={() => setActiveTab('tarefas')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === 'tarefas'
                  ? 'border-gold-500 text-gold-400'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">Tarefas</span>
              <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded-full">
                {reception.tarefasUnidade.length}
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && reception.chatActivo ? (
              <ChatInternoArea
                chat={reception.chatActivo}
                mensagens={reception.mensagensChatAtivo}
                onSendMessage={reception.enviarMensagemChat}
              />
            ) : activeTab === 'tarefas' ? (
              <div className="h-full overflow-y-auto p-4">
                <ReceptionKanban
                  tarefas={reception.tarefasUnidade}
                  onMover={reception.moverTarefa}
                  onAdicionar={reception.adicionarTarefa}
                  onDeletar={reception.removerTarefa}
                />
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </motion.div>
  );
}

export default function ReceptionModal() {
  return createPortal(<ReceptionModalContent />, document.body);
}
