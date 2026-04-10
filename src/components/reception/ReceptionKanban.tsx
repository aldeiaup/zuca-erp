import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Plus, MessageCircle } from 'lucide-react';
import type { TarefaRecepcao } from '../../store';

type Estado = TarefaRecepcao['estado'];

const COLUNAS: { estado: Estado; label: string; dot: string; border: string }[] = [
  { estado: 'a_fazer',        label: 'A Fazer',         dot: 'bg-slate-400',   border: 'border-slate-400/40' },
  { estado: 'em_atendimento', label: 'Em Atendimento',  dot: 'bg-[#0081FB]',   border: 'border-[#0081FB]/40' },
  { estado: 'finalizado',     label: 'Finalizado',      dot: 'bg-emerald-500', border: 'border-emerald-500/40' },
];

const ESTADOS_ORDER: Estado[] = ['a_fazer', 'em_atendimento', 'finalizado'];

const PRIO_DOT: Record<NonNullable<TarefaRecepcao['prioridade']>, string> = {
  alta:   'bg-red-500',
  normal: 'bg-[#0081FB]',
  baixa:  'bg-gray-400',
};

interface Props {
  tarefas: TarefaRecepcao[];
  onMover: (id: string, estado: Estado) => void;
  onAdicionar: (texto: string) => void;
  onDeletar: (id: string) => void;
}

function KanbanCardMini({
  tarefa,
  onMover,
  onDeletar,
}: {
  tarefa: TarefaRecepcao;
  onMover: (estado: Estado) => void;
  onDeletar: () => void;
}) {
  const idx = ESTADOS_ORDER.indexOf(tarefa.estado);
  const podeAvancar = idx < ESTADOS_ORDER.length - 1;
  const podeVoltar = idx > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bg-white border border-[#E4E6EB] rounded-xl p-3 shadow-sm group"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-[#050505] leading-snug flex-1">{tarefa.texto}</p>
        <button
          onClick={onDeletar}
          className="opacity-0 group-hover:opacity-100 text-[#65676B] hover:text-red-500 transition-all flex-shrink-0 mt-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1.5">
          {tarefa.prioridade && (
            <span className={`w-2 h-2 rounded-full ${PRIO_DOT[tarefa.prioridade]}`} />
          )}
          {tarefa.conversaId && (
            <MessageCircle className="w-3 h-3 text-[#0081FB]" />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {podeVoltar && (
            <button
              onClick={() => onMover(ESTADOS_ORDER[idx - 1])}
              className="p-0.5 hover:bg-[#F0F2F5] rounded text-[#65676B] hover:text-[#0081FB] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {podeAvancar && (
            <button
              onClick={() => onMover(ESTADOS_ORDER[idx + 1])}
              className="p-0.5 hover:bg-[#F0F2F5] rounded text-[#65676B] hover:text-[#0081FB] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ReceptionKanban({ tarefas, onMover, onAdicionar, onDeletar }: Props) {
  const [addingTexto, setAddingTexto] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleConfirm = () => {
    if (addingTexto.trim()) {
      onAdicionar(addingTexto.trim());
      setAddingTexto('');
    }
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#050505] uppercase tracking-widest">Tarefas</p>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 text-[10px] text-[#0081FB] hover:text-[#0066CC] font-semibold transition-colors"
        >
          <Plus className="w-3 h-3" /> Nova
        </button>
      </div>

      {/* Input rápido */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-white border border-[#0081FB]/40 rounded-xl p-2 shadow-sm"
          >
            <input
              autoFocus
              value={addingTexto}
              onChange={(e) => setAddingTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') { setIsAdding(false); setAddingTexto(''); }
              }}
              placeholder="Descreva a tarefa…"
              className="w-full text-xs text-[#050505] placeholder-[#65676B] outline-none bg-transparent"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setIsAdding(false); setAddingTexto(''); }}
                className="text-[10px] text-[#65676B] hover:text-[#050505]"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="text-[10px] font-bold text-white bg-[#0081FB] px-2 py-1 rounded-lg hover:bg-[#0066CC] transition-colors"
              >
                Adicionar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Colunas */}
      {COLUNAS.map((col) => {
        const cards = tarefas.filter((t) => t.estado === col.estado);
        return (
          <div key={col.estado}>
            <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${col.border}`}>
              <span className={`w-2 h-2 rounded-full ${col.dot}`} />
              <span className="text-[10px] font-bold text-[#65676B] uppercase tracking-widest flex-1">
                {col.label}
              </span>
              <span className="text-[10px] font-mono text-[#65676B] bg-[#F0F2F5] px-1.5 py-0.5 rounded-full">
                {cards.length}
              </span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {cards.map((t) => (
                  <KanbanCardMini
                    key={t.id}
                    tarefa={t}
                    onMover={(estado) => onMover(t.id, estado)}
                    onDeletar={() => onDeletar(t.id)}
                  />
                ))}
              </AnimatePresence>
              {cards.length === 0 && (
                <div className="border border-dashed border-[#E4E6EB] rounded-xl py-4 flex items-center justify-center">
                  <p className="text-[10px] text-[#65676B]">Sem tarefas</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
