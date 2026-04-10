import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { AlertTriangle, Clock, User } from 'lucide-react';
import type { Tarefa, EstadoTarefa, PrioridadeTarefa } from './types';

const estadoBorda: Record<EstadoTarefa, string> = {
  POR_INICIAR: 'border-l-slate-500',
  EM_EXECUCAO: 'border-l-orange-500',
  EM_REVISAO:  'border-l-amber-400',
  IMPEDIMENTO: 'border-l-red-500',
  CONCLUIDO:   'border-l-emerald-500',
};

const progressoFill: Record<EstadoTarefa, string> = {
  POR_INICIAR: 'bg-slate-500',
  EM_EXECUCAO: 'bg-orange-500',
  EM_REVISAO:  'bg-amber-400',
  IMPEDIMENTO: 'bg-red-500',
  CONCLUIDO:   'bg-emerald-500',
};

const prioridadeConfig: Record<PrioridadeTarefa, { label: string; classes: string }> = {
  BAIXA:   { label: 'Baixa',   classes: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
  NORMAL:  { label: 'Normal',  classes: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  ALTA:    { label: 'Alta',    classes: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  CRITICA: { label: 'Crítica', classes: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' },
};

interface Props {
  tarefa: Tarefa;
  onClick: () => void;
  onDragStart?: (tarefaId: string, estado: EstadoTarefa) => void;
}

export default function KanbanCard({ tarefa, onClick, onDragStart }: Props) {
  const prio = prioridadeConfig[tarefa.prioridade];
  const isVencido = tarefa.prazo && new Date(tarefa.prazo) < new Date() && tarefa.estado !== 'CONCLUIDO';

  return (
    <motion.div
      layoutId={tarefa.id}
      draggable
      onDragStart={(event) => {
        const e = event as unknown as React.DragEvent;
        e.dataTransfer.setData('tarefaId', tarefa.id);
        onDragStart?.(tarefa.id, tarefa.estado);
      }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={onClick}
      className={`
        border-l-4 ${estadoBorda[tarefa.estado]}
        bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 cursor-pointer
        border border-gray-700/50 hover:border-gray-600/70
        transition-colors duration-200 select-none
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="font-mono text-[10px] font-bold tracking-widest text-gray-400 bg-gray-900/60 px-2 py-0.5 rounded-md border border-gray-700/50">
          {tarefa.matricula}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${prio.classes}`}>
          {prio.label}
        </span>
      </div>

      {/* Serviço */}
      <p className="font-display font-semibold text-white text-sm leading-snug mb-1">
        {tarefa.titulo}
      </p>
      <p className="text-gray-500 text-xs mb-3">{tarefa.servico}</p>

      {/* Responsável */}
      <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
        <User className="w-3 h-3 flex-shrink-0" />
        <span>{tarefa.responsavel}</span>
        {tarefa.equipa && (
          <span className="text-gray-600">· {tarefa.equipa}</span>
        )}
      </div>

      {/* Barra de progresso */}
      {tarefa.progresso > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-gray-500">Progresso</span>
            <span className="text-[10px] font-mono font-bold text-gray-400">{tarefa.progresso}%</span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${progressoFill[tarefa.estado]}`}
              initial={{ width: 0 }}
              animate={{ width: `${tarefa.progresso}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Prazo */}
      {tarefa.prazo && (
        <div className={`flex items-center gap-1.5 text-[10px] ${isVencido ? 'text-red-400' : 'text-gray-500'}`}>
          {isVencido ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          <span className="font-mono">
            {format(new Date(tarefa.prazo), 'dd/MM/yyyy', { locale: pt })}
          </span>
          {isVencido && <span className="font-bold">· Vencido</span>}
        </div>
      )}
    </motion.div>
  );
}
