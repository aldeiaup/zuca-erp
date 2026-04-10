export const EstadoTarefa = {
  POR_INICIAR: 'POR_INICIAR',
  EM_EXECUCAO: 'EM_EXECUCAO',
  EM_REVISAO:  'EM_REVISAO',
  IMPEDIMENTO: 'IMPEDIMENTO',
  CONCLUIDO:   'CONCLUIDO',
} as const;
export type EstadoTarefa = typeof EstadoTarefa[keyof typeof EstadoTarefa];

export const PrioridadeTarefa = {
  BAIXA:   'BAIXA',
  NORMAL:  'NORMAL',
  ALTA:    'ALTA',
  CRITICA: 'CRITICA',
} as const;
export type PrioridadeTarefa = typeof PrioridadeTarefa[keyof typeof PrioridadeTarefa];

export interface ViaturaKanban {
  matricula: string;
  modelo: string;
  cor: string;
}

export interface Tarefa {
  id: string;
  titulo: string;
  matricula: string;
  servico: string;
  responsavel: string;
  prioridade: PrioridadeTarefa;
  estado: EstadoTarefa;
  progresso: number; // 0–100
  prazo?: string;    // ISO date string
  classificacao?: string;
  equipa?: string;
  resultado?: string;
  viaturaId?: string;
  ordemId?: string;
  gestorId?: string;
}
