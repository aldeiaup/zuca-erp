import { useState, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import type { TarefaRecepcao } from '../store';

export type Unidade = 'Benfica' | 'Alvalade';

export function useReception() {
  const {
    user,
    receptionOpen,
    setReceptionOpen,
    tarefasRecepcao,
    addTarefaRecepcao,
    updateTarefaRecepcao,
    deleteTarefaRecepcao,
    chatsInternos,
    mensagensChatInterno,
    sendChatInternoMessage,
  } = useStore();

  const [unidadeActiva, setUnidadeActiva] = useState<Unidade>('Benfica');
  const [chatActivoId, setChatActivoId] = useState<string | null>('chat geral');

  const chatActivo = useMemo(
    () => chatsInternos.find((c) => c.id === chatActivoId) ?? null,
    [chatsInternos, chatActivoId]
  );

  const mensagensChatAtivo = useMemo(
    () => (chatActivoId ? (mensagensChatInterno[chatActivoId] ?? []) : []),
    [mensagensChatInterno, chatActivoId]
  );

  const tarefasUnidade = useMemo(
    () => tarefasRecepcao[unidadeActiva],
    [tarefasRecepcao, unidadeActiva]
  );

  const openReception = useCallback(() => setReceptionOpen(true), [setReceptionOpen]);
  const closeReception = useCallback(() => {
    setReceptionOpen(false);
    setChatActivoId(null);
  }, [setReceptionOpen]);

  const trocarUnidade = useCallback((u: Unidade) => {
    setUnidadeActiva(u);
  }, []);

  const seleccionarChat = useCallback((id: string) => {
    setChatActivoId(id);
  }, []);

  const enviarMensagemChat = useCallback(
    (texto: string) => {
      if (!chatActivoId || !texto.trim()) return;
      sendChatInternoMessage(chatActivoId, texto, user?.nome ?? 'Atendente');
    },
    [chatActivoId, sendChatInternoMessage, user]
  );

  const moverTarefa = useCallback(
    (id: string, estado: TarefaRecepcao['estado']) => {
      updateTarefaRecepcao(unidadeActiva, id, { estado });
    },
    [unidadeActiva, updateTarefaRecepcao]
  );

  const adicionarTarefa = useCallback(
    (texto: string) => {
      addTarefaRecepcao(unidadeActiva, {
        texto,
        estado: 'a_fazer',
        prioridade: 'normal',
      });
    },
    [unidadeActiva, addTarefaRecepcao]
  );

  const removerTarefa = useCallback(
    (id: string) => deleteTarefaRecepcao(unidadeActiva, id),
    [unidadeActiva, deleteTarefaRecepcao]
  );

  return {
    isOpen: receptionOpen,
    user,
    unidadeActiva,
    chatActivoId,
    chatActivo,
    mensagensChatAtivo,
    tarefasUnidade,
    openReception,
    closeReception,
    trocarUnidade,
    seleccionarChat,
    enviarMensagemChat,
    moverTarefa,
    adicionarTarefa,
    removerTarefa,
  };
}

export function useReceptionBadge() {
  const { receptionOpen, setReceptionOpen } = useStore();
  return {
    totalNaoLidas: 0,
    isOpen: receptionOpen,
    openReception: () => setReceptionOpen(true),
  };
}
