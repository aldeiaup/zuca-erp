import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Car, Hash, Save, Trash2, ChevronDown, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../store';
import type { Tarefa, EstadoTarefa, PrioridadeTarefa } from '../kanban/types';
import { EstadoTarefa as E, PrioridadeTarefa as P } from '../kanban/types';

const ESTADOS: { value: EstadoTarefa; label: string }[] = [
  { value: E.POR_INICIAR, label: 'Por Iniciar' },
  { value: E.EM_EXECUCAO, label: 'Em Execução' },
  { value: E.EM_REVISAO,  label: 'Em Revisão' },
  { value: E.IMPEDIMENTO, label: 'Impedimento' },
  { value: E.CONCLUIDO,   label: 'Concluído' },
];

const PRIORIDADES: { value: PrioridadeTarefa; label: string }[] = [
  { value: P.BAIXA,   label: 'Baixa' },
  { value: P.NORMAL,  label: 'Normal' },
  { value: P.ALTA,    label: 'Alta' },
  { value: P.CRITICA, label: 'Crítica' },
];

const SETORES = [
  'Mecânica',
  'Elétrica',
  'Estética',
  'Chapa e Pintura',
  'Diagnóstico',
  'Suspensão e Direcção',
  'Transmissão',
  'Ar Condicionado',
  'Receção',
];

const estadoCor: Record<EstadoTarefa, string> = {
  POR_INICIAR: 'text-slate-400',
  EM_EXECUCAO: 'text-orange-400',
  EM_REVISAO:  'text-amber-400',
  IMPEDIMENTO: 'text-red-400',
  CONCLUIDO:   'text-emerald-400',
};

const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 focus:ring-gold-500 font-body placeholder-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const labelCls = 'block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5';

interface Props {
  tarefa: Tarefa;
  isNew?: boolean;
  somenteLeitura?: boolean;
  onClose: () => void;
}

export default function TarefaModal({ tarefa, isNew = false, somenteLeitura = false, onClose }: Props) {
  const {
    addTarefaKanban, updateTarefaKanban, deleteTarefaKanban,
    viaturas, ordensServico, funcionarios,
  } = useStore();

  // Funcionários activos para selects
  const colaboradores = funcionarios.filter((f) => f.ativo);
  const gestores = funcionarios.filter((f) => f.ativo && (f.tipo === 'gerente' || f.tipo === 'admin' || f.tipo === 'master'));

  const [form, setForm] = useState<Omit<Tarefa, 'id'>>({
    titulo:        tarefa.titulo,
    matricula:     tarefa.matricula,
    servico:       tarefa.servico,
    responsavel:   tarefa.responsavel,
    prioridade:    tarefa.prioridade,
    estado:        tarefa.estado,
    progresso:     tarefa.progresso,
    prazo:         tarefa.prazo || '',
    classificacao: tarefa.classificacao || '',
    equipa:        tarefa.equipa || '',
    resultado:     tarefa.resultado || '',
    viaturaId:     tarefa.viaturaId,
    ordemId:       tarefa.ordemId,
    gestorId:      tarefa.gestorId || '',
  });

  const viatura = viaturas.find((v) => v.id === tarefa.viaturaId);
  const ordem   = ordensServico.find((o) => o.id === tarefa.ordemId);
  const gestor  = funcionarios.find((f) => f.id === form.gestorId);

  const patch = (data: Partial<typeof form>) => setForm((f) => ({ ...f, ...data }));

  const handleSave = () => {
    if (!form.titulo.trim() || !form.matricula.trim()) {
      toast.error('Título e matrícula são obrigatórios.');
      return;
    }
    if (isNew) {
      addTarefaKanban(form);
      toast.success('Tarefa criada com sucesso!');
    } else {
      updateTarefaKanban(tarefa.id, form);
      toast.success('Tarefa actualizada!');
    }
    onClose();
  };

  const handleDelete = () => {
    deleteTarefaKanban(tarefa.id);
    toast.success('Tarefa removida.');
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: 520 }}
        animate={{ x: 0 }}
        exit={{ x: 520 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-gray-900 border-l border-gray-700/50 z-50 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
              {isNew ? 'Nova Tarefa' : 'Detalhes da Tarefa'}
            </p>
            <h2 className="font-display font-bold text-white text-lg leading-tight">
              {form.titulo || 'Sem título'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viatura / OS info */}
        {(viatura || ordem) && (
          <div className="px-6 py-3 bg-gray-800/40 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Car className="w-4 h-4 text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                {viatura && (
                  <p className="text-white text-sm font-medium">
                    {viatura.marca} {viatura.modelo}
                    <span className="ml-2 font-mono text-xs bg-gray-700 px-2 py-0.5 rounded-md text-gray-300">{viatura.matricula}</span>
                  </p>
                )}
                {viatura?.cor && <p className="text-gray-500 text-xs mt-0.5">Cor: {viatura.cor}</p>}
                {ordem && (
                  <div className="flex items-center gap-1 mt-1">
                    <Hash className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500 font-mono">{ordem.numero}</span>
                    <span className="text-gray-700">·</span>
                    <span className="text-xs text-gray-500">{ordem.servico}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gestor badge (quando já seleccionado) */}
        {gestor && (
          <div className="px-6 py-2.5 bg-amber-500/5 border-b border-amber-500/20 flex items-center gap-2 flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Gestor:</span>
            <span className="text-xs text-amber-300 font-medium">{gestor.nome}</span>
            <span className="text-gray-600 text-[10px] ml-1">· {gestor.cargo}</span>
          </div>
        )}

        {/* Formulário */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          <div>
            <label className={labelCls}>Título</label>
            <input className={inputCls} value={form.titulo} placeholder="Ex: Polimento Completo"
              onChange={(e) => patch({ titulo: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Matrícula</label>
              <input className={`${inputCls} font-mono`} value={form.matricula} placeholder="LD-00-00-AA"
                onChange={(e) => patch({ matricula: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Serviço</label>
              <input className={inputCls} value={form.servico} placeholder="Ex: Estética"
                onChange={(e) => patch({ servico: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Estado</label>
              <div className="relative">
                <select
                  value={form.estado}
                  onChange={(e) => patch({ estado: e.target.value as EstadoTarefa })}
                  className={`${inputCls} appearance-none pr-8 ${estadoCor[form.estado]}`}
                >
                  {ESTADOS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Prioridade</label>
              <div className="relative">
                <select
                  value={form.prioridade}
                  onChange={(e) => patch({ prioridade: e.target.value as PrioridadeTarefa })}
                  className={`${inputCls} appearance-none pr-8`}
                >
                  {PRIORIDADES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>
              Progresso — <span className="text-gold-400 font-mono">{form.progresso}%</span>
            </label>
            <input
              type="range" min={0} max={100} step={5}
              value={form.progresso}
              onChange={(e) => patch({ progresso: Number(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-gold-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Prazo de Entrega</label>
              <input type="date" className={inputCls} value={form.prazo || ''}
                onChange={(e) => patch({ prazo: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Classificação</label>
              <input className={inputCls} value={form.classificacao || ''} placeholder="Ex: Polidor"
                onChange={(e) => patch({ classificacao: e.target.value })} />
            </div>
          </div>

          {/* Responsável — select dos colaboradores */}
          <div>
            <label className={labelCls}>Colaborador Responsável</label>
            <div className="relative">
              <select
                value={form.responsavel}
                onChange={(e) => patch({ responsavel: e.target.value })}
                className={`${inputCls} appearance-none pr-8`}
              >
                <option value="">— Seleccionar colaborador —</option>
                {colaboradores.map((f) => (
                  <option key={f.id} value={f.nome}>
                    {f.nome} · {f.cargo}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            {form.responsavel && (
              <p className="text-[10px] text-gray-500 mt-1 pl-1">
                {colaboradores.find((f) => f.nome === form.responsavel)?.cargo || ''}
              </p>
            )}
          </div>

          {/* Sector / Equipa — select fixo */}
          <div>
            <label className={labelCls}>Sector / Equipa</label>
            <div className="relative">
              <select
                value={form.equipa || ''}
                onChange={(e) => patch({ equipa: e.target.value })}
                className={`${inputCls} appearance-none pr-8`}
              >
                <option value="">— Seleccionar sector —</option>
                {SETORES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Gestor Responsável do Sector */}
          <div>
            <label className={labelCls}>Gestor Responsável do Sector</label>
            <div className="relative">
              <select
                value={form.gestorId || ''}
                onChange={(e) => patch({ gestorId: e.target.value })}
                className={`${inputCls} appearance-none pr-8`}
              >
                <option value="">— Seleccionar gestor —</option>
                {gestores.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome} · {g.cargo}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Output / Resultado</label>
            <textarea
              rows={4}
              className={`${inputCls} resize-none`}
              value={form.resultado || ''}
              placeholder="Descreva o resultado ou observações do serviço…"
              onChange={(e) => patch({ resultado: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex gap-3 flex-shrink-0">
          {!isNew && !somenteLeitura && (
            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-sm transition-colors border border-gray-700"
          >
            {somenteLeitura ? 'Fechar' : 'Cancelar'}
          </button>
          {!somenteLeitura && (
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-gold-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isNew ? 'Criar Tarefa' : 'Guardar'}
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
