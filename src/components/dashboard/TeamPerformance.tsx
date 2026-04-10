import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Trophy, Target, Clock, Zap, Users,
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import type { Tarefa } from '../kanban/types';
import type { Funcionario } from '../../store';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PerfilDesempenho {
  funcionario: Funcionario;
  total: number;
  concluidas: number;
  abertas: number;
  emAtraso: number;
  noPrazo: number;
  progressoMedio: number;
  taxaNoPrazo: number;   // 0–100
  produtividade: number; // 0–100
  regularidade: number;  // 0–100
  score: number;         // 0–100 ponderado
  ranking: number;
  tendencia: 'up' | 'down' | 'stable';
}

interface Props {
  tarefas: Tarefa[];
  funcionarios: Funcionario[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(nome: string) {
  return nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  'from-[#0081FB] to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-500 to-amber-700',
  'from-purple-500 to-purple-700',
  'from-rose-500 to-rose-700',
  'from-teal-500 to-teal-700',
  'from-indigo-500 to-indigo-700',
];
function avatarGradient(nome: string) {
  const sum = nome.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

function scoreColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500/30' };
  if (score >= 60) return { text: 'text-amber-400',   bg: 'bg-amber-500',   ring: 'ring-amber-500/30'   };
  return              { text: 'text-rose-400',    bg: 'bg-rose-500',    ring: 'ring-rose-500/30'    };
}

function calcularPerfil(
  f: Funcionario,
  tarefas: Tarefa[],
  hoje: Date,
): Omit<PerfilDesempenho, 'ranking' | 'tendencia'> {
  const minhas = tarefas.filter(t => t.responsavel === f.nome);
  const concluidas = minhas.filter(t => t.estado === 'CONCLUIDO');
  const abertas    = minhas.filter(t => t.estado !== 'CONCLUIDO');

  // emAtraso: tarefas abertas com prazo vencido
  const emAtraso = abertas.filter(t => t.prazo && new Date(t.prazo) < hoje).length;

  // noPrazo: concluídas onde o prazo ainda não passou (ou sem prazo)
  const noPrazo = concluidas.filter(
    t => !t.prazo || new Date(t.prazo) >= hoje
  ).length;

  const taxaNoPrazo   = concluidas.length > 0 ? Math.round((noPrazo / concluidas.length) * 100) : (minhas.length === 0 ? 0 : 100);
  const produtividade = minhas.length > 0 ? Math.round((concluidas.length / minhas.length) * 100) : 0;
  const progressoMedio = minhas.length > 0
    ? Math.round(minhas.reduce((s, t) => s + t.progresso, 0) / minhas.length)
    : 0;
  const regularidade = progressoMedio;

  // Score ponderado: entrega 40% + produtividade 40% + regularidade 20%
  const score = Math.round(taxaNoPrazo * 0.4 + produtividade * 0.4 + regularidade * 0.2);

  return { funcionario: f, total: minhas.length, concluidas: concluidas.length, abertas: abertas.length, emAtraso, noPrazo, progressoMedio, taxaNoPrazo, produtividade, regularidade, score };
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        {sub && <p className="text-[11px] text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BarKpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-gray-400">{label}</span>
        <span className={`text-[10px] font-bold ${color}`}>{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  );
}

function PodiumCard({ perfil, pos }: { perfil: PerfilDesempenho; pos: 1 | 2 | 3 }) {
  const colors = {
    1: { ring: 'ring-amber-400/50',   bg: 'from-amber-500/10 to-amber-600/5',   label: 'bg-amber-500',   text: 'text-amber-400',   icon: '🥇', height: 'pt-4' },
    2: { ring: 'ring-slate-400/40',   bg: 'from-slate-500/10 to-slate-600/5',   label: 'bg-slate-400',   text: 'text-slate-300',   icon: '🥈', height: 'pt-8' },
    3: { ring: 'ring-orange-700/40',  bg: 'from-orange-700/10 to-orange-800/5', label: 'bg-orange-700',  text: 'text-orange-600',  icon: '🥉', height: 'pt-10' },
  }[pos];

  const sc = scoreColor(perfil.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: pos * 0.1 }}
      className={`${colors.height} flex flex-col items-center`}
    >
      <div className={`w-full bg-gradient-to-b ${colors.bg} border ${colors.ring} ring-1 rounded-2xl p-4 flex flex-col items-center gap-2 relative`}>
        {/* Medalha */}
        <span className="text-2xl -mt-1">{colors.icon}</span>

        {/* Avatar */}
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradient(perfil.funcionario.nome)} flex items-center justify-center ring-2 ${colors.ring}`}>
          <span className="text-white text-sm font-bold">{getInitials(perfil.funcionario.nome)}</span>
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-sm leading-tight">
            {perfil.funcionario.nome.split(' ')[0]}
          </p>
          <p className="text-gray-400 text-[10px]">{perfil.funcionario.cargo}</p>
        </div>

        {/* Score */}
        <div className={`${sc.text} text-xl font-bold font-mono`}>{perfil.score}</div>
        <p className="text-[9px] text-gray-500 uppercase tracking-widest -mt-1">score</p>

        {/* Mini KPIs */}
        <div className="w-full space-y-1.5 pt-1 border-t border-gray-700/50">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">No prazo</span>
            <span className="text-emerald-400 font-semibold">{perfil.taxaNoPrazo}%</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">Produtiv.</span>
            <span className="text-[#0081FB] font-semibold">{perfil.produtividade}%</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-400">Tarefas</span>
            <span className="text-white font-semibold">{perfil.concluidas}/{perfil.total}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RankingRow({ perfil, index }: { perfil: PerfilDesempenho; index: number }) {
  const sc = scoreColor(perfil.score);
  const TendIcon = perfil.tendencia === 'up' ? TrendingUp : perfil.tendencia === 'down' ? TrendingDown : Minus;
  const tendColor = perfil.tendencia === 'up' ? 'text-emerald-400' : perfil.tendencia === 'down' ? 'text-rose-400' : 'text-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 bg-gray-800/30 hover:bg-gray-700/30 rounded-xl border border-gray-700/30 transition-colors group"
    >
      {/* Posição */}
      <span className="text-lg font-bold text-gray-500 w-6 text-center flex-shrink-0">
        {perfil.ranking}
      </span>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(perfil.funcionario.nome)} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white text-xs font-bold">{getInitials(perfil.funcionario.nome)}</span>
      </div>

      {/* Nome + Cargo */}
      <div className="w-36 flex-shrink-0">
        <p className="text-sm font-semibold text-white truncate">{perfil.funcionario.nome}</p>
        <p className="text-[10px] text-gray-500 truncate">{perfil.funcionario.cargo}</p>
      </div>

      {/* Score bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold ${sc.text}`}>{perfil.score} pts</span>
          <TendIcon className={`w-3 h-3 ${tendColor}`} />
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${perfil.score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
            className={`h-full rounded-full ${sc.bg}`}
          />
        </div>
      </div>

      {/* KPI badges */}
      <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
        <div className="text-center w-14">
          <p className="text-[10px] text-gray-500">No Prazo</p>
          <p className="text-xs font-bold text-emerald-400">{perfil.taxaNoPrazo}%</p>
        </div>
        <div className="text-center w-14">
          <p className="text-[10px] text-gray-500">Produtiv.</p>
          <p className="text-xs font-bold text-[#0081FB]">{perfil.produtividade}%</p>
        </div>
        <div className="text-center w-14">
          <p className="text-[10px] text-gray-500">Progresso</p>
          <p className="text-xs font-bold text-purple-400">{perfil.progressoMedio}%</p>
        </div>
      </div>

      {/* Tarefas + alertas */}
      <div className="hidden xl:flex items-center gap-2 flex-shrink-0 w-24 justify-end">
        <span className="text-xs text-gray-400">{perfil.concluidas}<span className="text-gray-600">/{perfil.total}</span></span>
        {perfil.emAtraso > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full">
            <AlertTriangle className="w-2.5 h-2.5" />
            {perfil.emAtraso}
          </span>
        )}
        {perfil.emAtraso === 0 && perfil.total > 0 && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        )}
      </div>
    </motion.div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function TeamPerformance({ tarefas, funcionarios }: Props) {
  const hoje = new Date();
  const mesLabel = format(hoje, "MMMM 'de' yyyy", { locale: pt });
  // Capitalizar
  const mesCapt = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);

  const perfis = useMemo<PerfilDesempenho[]>(() => {
    // Inclui todos os activos excepto o utilizador master (CEO vê a equipa, não a si próprio no ranking)
    const activos = funcionarios.filter(f => f.ativo && f.tipo !== 'master');
    const raw = activos.map(f => calcularPerfil(f, tarefas, hoje));
    const sorted = [...raw].sort((a, b) => b.score - a.score);

    return sorted.map((p, idx) => ({
      ...p,
      ranking: idx + 1,
      // Tendência simulada com base na posição e score para o mock
      tendencia: (p.score >= 75 ? 'up' : p.score >= 50 ? 'stable' : 'down') as 'up' | 'down' | 'stable',
    }));
  }, [tarefas, funcionarios]);

  // KPIs globais
  const totalActivos    = perfis.length;
  const totalConcluidas = perfis.reduce((s, p) => s + p.concluidas, 0);
  const totalTarefas    = perfis.reduce((s, p) => s + p.total, 0);
  const totalNoPrazo    = perfis.reduce((s, p) => s + p.noPrazo, 0);
  const taxaGlobalNoPrazo = totalConcluidas > 0 ? Math.round((totalNoPrazo / totalConcluidas) * 100) : 0;
  const produtividadeMedia = perfis.length > 0
    ? Math.round(perfis.reduce((s, p) => s + p.produtividade, 0) / perfis.length)
    : 0;
  const totalEmAtraso = perfis.reduce((s, p) => s + p.emAtraso, 0);

  const top3 = perfis.slice(0, 3) as [PerfilDesempenho, PerfilDesempenho?, PerfilDesempenho?];

  return (
    <section className="space-y-6">
      {/* Cabeçalho da secção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Performance da Equipa</h2>
            <p className="text-xs text-gray-400">{mesCapt} · Visão exclusiva CEO</p>
          </div>
        </div>
        {totalEmAtraso > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs text-rose-400 font-semibold">{totalEmAtraso} em atraso</span>
          </div>
        )}
      </div>

      {/* KPI summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users}        label="Equipa Activa"    value={totalActivos}             sub="colaboradores"       color="bg-gradient-to-br from-[#0081FB] to-blue-700" />
        <KpiCard icon={CheckCircle2} label="Concluídas"       value={`${totalConcluidas}/${totalTarefas}`} sub="tarefas este mês" color="bg-gradient-to-br from-emerald-500 to-emerald-700" />
        <KpiCard icon={Clock}        label="Entrega no Prazo" value={`${taxaGlobalNoPrazo}%`}  sub="taxa da equipa"      color="bg-gradient-to-br from-amber-500 to-amber-700" />
        <KpiCard icon={Zap}          label="Produtividade"    value={`${produtividadeMedia}%`} sub="média ponderada"     color="bg-gradient-to-br from-purple-500 to-purple-700" />
      </div>

      {/* Pódio + tabela */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pódio — top 3 */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-4 h-4 text-amber-400" />
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Pódio do Mês</p>
          </div>

          {perfis.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">Sem dados de desempenho</div>
          ) : (
            <div className="grid grid-cols-3 gap-3 items-end">
              {/* 2.º lugar */}
              {top3[1] ? (
                <PodiumCard perfil={top3[1]} pos={2} />
              ) : <div />}
              {/* 1.º lugar */}
              {top3[0] && <PodiumCard perfil={top3[0]} pos={1} />}
              {/* 3.º lugar */}
              {top3[2] ? (
                <PodiumCard perfil={top3[2]} pos={3} />
              ) : <div />}
            </div>
          )}

          {/* Legenda KPI */}
          <div className="mt-6 pt-4 border-t border-gray-700/50 grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'No Prazo', color: 'text-emerald-400' },
              { label: 'Produtiv.', color: 'text-[#0081FB]' },
              { label: 'Score', color: 'text-amber-400' },
            ].map(({ label, color }) => (
              <div key={label}>
                <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')} mx-auto mb-1`} />
                <p className={`text-[10px] font-semibold ${color}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking completo */}
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#0081FB]" />
              <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Ranking Geral</p>
            </div>
            <span className="text-[10px] text-gray-500 bg-gray-700/50 px-2 py-1 rounded-full">
              {perfis.length} colaboradores
            </span>
          </div>

          <div className="space-y-2">
            {perfis.map((p, i) => (
              <RankingRow key={p.funcionario.id} perfil={p} index={i} />
            ))}
          </div>

          {perfis.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-600" />
              Sem dados de desempenho disponíveis
            </div>
          )}

          {/* Escala de score */}
          <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center gap-4">
            <p className="text-[10px] text-gray-500 flex-shrink-0">Escala de score:</p>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'Excelente ≥ 80', cls: 'bg-emerald-500/20 text-emerald-400' },
                { label: 'Bom 60–79',       cls: 'bg-amber-500/20 text-amber-400'   },
                { label: 'A melhorar < 60', cls: 'bg-rose-500/20 text-rose-400'     },
              ].map(({ label, cls }) => (
                <span key={label} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown individual — linha de cards por pessoa */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Breakdown Individual</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {perfis.map((p, i) => {
            const sc = scoreColor(p.score);
            return (
              <motion.div
                key={p.funcionario.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                className="bg-gray-800/40 border border-gray-700/40 rounded-2xl p-5 hover:border-gray-600/60 transition-colors"
              >
                {/* Cabeçalho do card */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(p.funcionario.nome)} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-sm font-bold">{getInitials(p.funcionario.nome)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{p.funcionario.nome}</p>
                      <span className="text-[9px] text-gray-500">#{p.ranking}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{p.funcionario.cargo}</p>
                  </div>
                  <div className={`text-xl font-bold font-mono ${sc.text}`}>{p.score}</div>
                </div>

                {/* KPI bars */}
                <div className="space-y-2.5">
                  <BarKpi label="Entrega no Prazo" value={p.taxaNoPrazo}   color="text-emerald-400" />
                  <BarKpi label="Produtividade"    value={p.produtividade} color="text-[#0081FB]"   />
                  <BarKpi label="Progresso Médio"  value={p.regularidade} color="text-purple-400"  />
                </div>

                {/* Footer do card */}
                <div className="mt-4 pt-3 border-t border-gray-700/40 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span><span className="font-semibold text-white">{p.concluidas}</span> concluídas</span>
                    <span><span className="font-semibold text-white">{p.abertas}</span> abertas</span>
                  </div>
                  {p.emAtraso > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {p.emAtraso} em atraso
                    </span>
                  ) : p.total > 0 ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Sem atrasos
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500">Sem tarefas</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
