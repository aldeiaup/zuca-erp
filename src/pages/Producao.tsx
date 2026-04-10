import { useState } from 'react';
import { LayoutGrid, Users } from 'lucide-react';
import { useStore } from '../store';
import KanbanBoard from '../components/kanban/KanbanBoard';

type Vista = 'geral' | 'minha';

export default function Producao() {
  const { user } = useStore();

  // Tipos com acesso ao quadro geral e criação de tarefas
  const isGestor = user?.tipo === 'master' || user?.tipo === 'admin' || user?.tipo === 'gerente';

  // Colaboradores vão directo para a sua vista pessoal
  const [vista, setVista] = useState<Vista>(isGestor ? 'geral' : 'minha');

  return (
    <div className="space-y-4">
      {/* Header da página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Produção</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isGestor
              ? 'Gestão e acompanhamento de todos os serviços em curso'
              : `As suas tarefas atribuídas — ${user?.nome?.split(' ')[0]}`}
          </p>
        </div>

        {/* Tabs de vista — apenas visíveis para gestores */}
        {isGestor && (
          <div className="flex gap-1 p-1 bg-gray-800/60 rounded-xl border border-gray-700/50">
            <button
              onClick={() => setVista('geral')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                vista === 'geral'
                  ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Quadro Geral
            </button>
            <button
              onClick={() => setVista('minha')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                vista === 'minha'
                  ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              O Meu Quadro
            </button>
          </div>
        )}
      </div>

      {/* Quadro Geral — apenas gestores, vê tudo e pode criar */}
      {vista === 'geral' && isGestor && (
        <KanbanBoard
          filtroResponsavel={null}
          somenteLeitura={false}
          titulo="Quadro Geral de Produção"
        />
      )}

      {/* Quadro pessoal — tarefas atribuídas ao utilizador logado */}
      {vista === 'minha' && (
        <KanbanBoard
          filtroResponsavel={user?.nome ?? null}
          somenteLeitura={!isGestor}
          titulo="O Meu Quadro"
          subtitulo={`Tarefas atribuídas a ${user?.nome?.split(' ')[0]}`}
        />
      )}
    </div>
  );
}
