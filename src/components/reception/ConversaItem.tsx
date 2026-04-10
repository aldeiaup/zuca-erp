import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Pin } from 'lucide-react';
import type { Conversa } from '../../store';

const STATUS_DOT: Record<Conversa['status'], string> = {
  ativa:     'bg-emerald-500',
  pendente:  'bg-amber-400',
  resolvida: 'bg-[#0081FB]',
  arquivada: 'bg-gray-400',
};

const CANAL_BADGE: Record<Conversa['canal'], { label: string; cls: string }> = {
  whatsapp:  { label: 'WA',  cls: 'bg-[#25D366] text-white' },
  instagram: { label: 'IG',  cls: 'bg-gradient-to-r from-[#E1306C] to-[#833AB4] text-white' },
};

function getInitials(nome: string) {
  return nome.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'bg-[#0081FB]', 'bg-emerald-500', 'bg-amber-500',
  'bg-purple-500', 'bg-rose-500', 'bg-teal-500',
];

function avatarColor(nome: string) {
  const sum = nome.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

interface Props {
  conversa: Conversa;
  isActive: boolean;
  onClick: () => void;
}

export default function ConversaItem({ conversa, isActive, onClick }: Props) {
  const canalBadge = CANAL_BADGE[conversa.canal];

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 border-b border-[#E4E6EB] transition-colors
        ${isActive
          ? 'bg-[#E7F3FF] border-l-4 border-l-[#0081FB]'
          : 'hover:bg-[#F5F5F5] border-l-4 border-l-transparent'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {conversa.avatar ? (
            <img
              src={conversa.avatar}
              alt={conversa.clienteNome}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className={`w-10 h-10 rounded-full ${avatarColor(conversa.clienteNome)} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">{getInitials(conversa.clienteNome)}</span>
            </div>
          )}
          {/* Status dot */}
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STATUS_DOT[conversa.status]}`} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {conversa.fixada && <Pin className="w-3 h-3 text-[#65676B] flex-shrink-0" />}
              <p className={`text-sm truncate ${isActive ? 'font-semibold text-[#050505]' : 'font-medium text-[#050505]'}`}>
                {conversa.clienteNome}
              </p>
            </div>
            <span className="text-[10px] text-[#65676B] flex-shrink-0">
              {format(new Date(conversa.ultimaHora), 'HH:mm', { locale: pt })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            <p className="text-xs text-[#65676B] truncate flex-1">{conversa.ultimaMensagem}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Canal badge */}
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${canalBadge.cls}`}>
                {canalBadge.label}
              </span>
              {/* Badge não lidas */}
              {conversa.naoLidas > 0 && (
                <span className="min-w-[18px] h-[18px] bg-[#0081FB] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {conversa.naoLidas > 99 ? '99+' : conversa.naoLidas}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
