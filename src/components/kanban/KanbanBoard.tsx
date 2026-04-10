import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, LayoutGrid, Lock } from 'lucide-react';
import { useStore } from '../../store';
import type { Tarefa, EstadoTarefa } from './types';
import { EstadoTarefa as E, PrioridadeTarefa } from './types';
import KanbanCard from './KanbanCard';
import TarefaModal from '../modal/TarefaModal';

interface DragItem {
  tarefaId: string;
  origenEstado: EstadoTarefa;
}

const COLUNAS: {
  estado: EstadoTarefa;
  label: string;
  cor: string;
  dot: string;
  header: string;
}[] = [
  { estado: E.POR_INICIAR, label: 'Por Iniciar',  cor: 'text-slate-400',   dot: 'bg-slate-500',   header: 'border-slate-500/30' },
  { estado: E.EM_EXECUCAO, label: 'Em Execução',  cor: 'text-orange-400',  dot: 'bg-orange-500',  header: 'border-orange-500/30' },
  { estado: E.EM_REVISAO,  label: 'Em Revisão',   cor: 'text-amber-400',   dot: 'bg-amber-400',   header: 'border-amber-400/30' },
  { estado: E.IMPEDIMENTO, label: 'Impedimento',  cor: 'text-red-400',     dot: 'bg-red-500',     header: 'border-red-500/30' },
  { estado: E.CONCLUIDO,   label: 'Concluído',    cor: 'text-emerald-400', dot: 'bg-emerald-500', header: 'border-emerald-500/30' },
];

interface Props {
  /** Filtra tarefas por nome do responsável. null = mostra tudo */
  filtroResponsavel?: string | null;
  /** Impede criação de novas tarefas (para colaboradores) */
  somenteLeitura?: boolean;
  /** Label descritivo no header do board */
  titulo?: string;
  subtitulo?: string;
}

export default function KanbanBoard({
  filtroResponsavel = null,
  somenteLeitura = false,
  titulo = 'Quadro de Produção',
  subtitulo,
}: Props) {
  const { tarefasKanban, updateTarefaKanban } = useStore();
  const [modalTarefa, setModalTarefa] = useState<Tarefa | null>(null);
  const [novoEstado, setNovoEstado] = useState<EstadoTarefa | null>(null);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  // Filtra por responsável quando aplicável
  const tarefasFiltradas = filtroResponsavel
    ? tarefasKanban.filter((t) => t.responsavel === filtroResponsavel)
    : tarefasKanban;

  const handleDragStart = (tarefaId: string, origenEstado: EstadoTarefa) => {
    setDraggedItem({ tarefaId, origenEstado });
  };

  const handleDragOver = (e: React.DragEvent, estado: EstadoTarefa) => {
    e.preventDefault();
    if (!draggedItem || somenteLeitura) return;
    if (draggedItem.origenEstado !== estado) {
      updateTarefaKanban(draggedItem.tarefaId, { estado });
      setDraggedItem({ tarefaId: draggedItem.tarefaId, origenEstado: estado });
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleAddNova = (estado: EstadoTarefa) => {
    if (somenteLeitura) return;
    const nova: Tarefa = {
      id: '',
      titulo: '',
      matricula: '',
      servico: '',
      responsavel: filtroResponsavel || '',
      prioridade: PrioridadeTarefa.NORMAL,
      estado,
      progresso: 0,
    };
    setNovoEstado(estado);
    setModalTarefa(nova);
  };

  const sub = subtitulo ?? `${tarefasFiltradas.length} tarefa${tarefasFiltradas.length !== 1 ? 's' : ''}`;

  return (
    <>
      {/* Board header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 text-gold-400" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{titulo}</p>
            <p className="text-xs text-gray-400">{sub}</p>
          </div>
        </div>
        {somenteLeitura && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 border border-gray-700/50 px-2.5 py-1 rounded-full">
            <Lock className="w-3 h-3" />
            <span>Atribuição pelo gestor</span>
          </div>
        )}
      </div>

      {/* Sem tarefas atribuídas */}
      {somenteLeitura && tarefasFiltradas.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-gray-600" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-sm">Nenhuma tarefa atribuída</p>
            <p className="text-gray-500 text-xs mt-1">O seu gestor ainda não atribuiu tarefas.</p>
          </div>
        </motion.div>
      )}

      {/* Colunas */}
      {tarefasFiltradas.length > 0 || !somenteLeitura ? (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start snap-x snap-mandatory scroll-smooth">
          {COLUNAS.map((col) => {
            const cards = tarefasFiltradas.filter((t) => t.estado === col.estado);
            return (
              <div key={col.estado} className="flex-shrink-0 w-[min(288px,80vw)] snap-start flex flex-col">
                {/* Header da coluna */}
                <div 
                  onDragOver={(e) => handleDragOver(e, col.estado)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between px-3 py-2.5 mb-3 rounded-xl bg-gray-800/60 border ${col.header}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-xs font-bold font-display uppercase tracking-wider ${col.cor}`}>
                      {col.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-gray-700/60 text-gray-400 px-2 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>

                {/* Cards */}
                <div 
                  onDragOver={(e) => handleDragOver(e, col.estado)}
                  onDragEnd={handleDragEnd}
                  className="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-0.5"
                >
                  <AnimatePresence mode="popLayout">
                    {cards.map((tarefa) => (
                      <KanbanCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        onClick={() => { setNovoEstado(null); setModalTarefa(tarefa); }}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  </AnimatePresence>

                  {cards.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-2 border-dashed border-gray-700/40 rounded-xl py-8 flex flex-col items-center gap-2"
                    >
                      <span className={`w-6 h-6 rounded-full ${col.dot} opacity-20`} />
                      <p className="text-[10px] text-gray-600 font-medium">Sem tarefas</p>
                    </motion.div>
                  )}
                </div>

                {/* Botão adicionar — só para gestores */}
                {!somenteLeitura && (
                  <button
                    onClick={() => handleAddNova(col.estado)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-gray-700/50 text-gray-600 hover:border-gray-500 hover:text-gray-400 transition-colors text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Modal */}
      <AnimatePresence>
        {modalTarefa && (
          <TarefaModal
            tarefa={modalTarefa}
            isNew={novoEstado !== null}
            somenteLeitura={somenteLeitura}
            onClose={() => { setModalTarefa(null); setNovoEstado(null); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
