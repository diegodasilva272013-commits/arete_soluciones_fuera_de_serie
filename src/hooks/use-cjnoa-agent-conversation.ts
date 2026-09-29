'use client';

import { useCallback, useRef, useState } from 'react';
import { Conversation } from '@11labs/client';

// Mismo agent_id real de Centro Jurídico NOA que ya está en producción
// en /empresa/agentes-ia (agente de voz del estudio, Jujuy). Se puede
// pisar con NEXT_PUBLIC_CJNOA_AGENT_ID en Vercel si en algún momento
// hay que apuntar este tester a un agente distinto (por ej. uno nuevo,
// específico para las ramas de jubilaciones que lista esta página).
const CJNOA_AGENT_ID =
  process.env.NEXT_PUBLIC_CJNOA_AGENT_ID || 'agent_9801m2tg8136e28sbnjptxxq1841';

export type CJNoaConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export type CJNoaChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: Date;
};

export function useCJNoaAgentConversation() {
  const convRef = useRef<Conversation | null>(null);
  const [status, setStatus] = useState<CJNoaConnectionStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<CJNoaChatMessage[]>([]);

  const addMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, text, createdAt: new Date() },
    ]);
  }, []);

  const connect = useCallback(async () => {
    if (status === 'connecting' || status === 'connected') return;

    if (!CJNOA_AGENT_ID) {
      setStatus('error');
      setErrorMessage('Falta configurar NEXT_PUBLIC_CJNOA_AGENT_ID en las variables de entorno.');
      return;
    }

    setStatus('connecting');
    setErrorMessage(null);

    try {
      const conv = await Conversation.startSession({
        agentId: CJNOA_AGENT_ID,
        onConnect: () => setStatus('connected'),
        onDisconnect: () => {
          convRef.current = null;
          setStatus('disconnected');
        },
        onError: (message) => {
          setErrorMessage(message || 'Error de conexión con el agente.');
          setStatus('error');
        },
        onMessage: ({ message, source }) => {
          // El mensaje del usuario ya se muestra al enviarlo (sendMessage);
          // acá solo se agregan las respuestas del agente, para no
          // duplicar lo que el usuario mismo tipeó.
          if (source === 'ai') addMessage('assistant', message);
        },
      });

      convRef.current = conv;
      // Es un entorno de prueba por texto (WhatsApp simulado): se silencia
      // el micrófono y el audio de salida, aunque la conexión underlying
      // siga siendo la misma sesión de voz de la SDK.
      conv.setMicMuted(true);
      conv.setVolume({ volume: 0 });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo conectar con el agente.');
    }
  }, [status, addMessage]);

  const sendMessage = useCallback(
    (text: string) => {
      const conv = convRef.current;
      if (!conv || status !== 'connected') return;
      addMessage('user', text);
      conv.sendUserMessage(text);
    },
    [status, addMessage],
  );

  const disconnect = useCallback(async () => {
    await convRef.current?.endSession();
    convRef.current = null;
    setStatus('disconnected');
  }, []);

  return { messages, status, errorMessage, connect, disconnect, sendMessage };
}
