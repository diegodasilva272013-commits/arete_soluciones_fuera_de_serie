'use client';

import { useCallback, useRef, useState } from 'react';
import { Conversation } from '@11labs/client';

// El agent_id del agente real de Centro Jurídico NOA vive acá, en una
// sola variable de entorno pública (hace falta en el cliente para
// Conversation.startSession). Configurarla en Vercel →
// NEXT_PUBLIC_CJNOA_AGENT_ID=agent_xxxxx antes de usar esta página —
// sin eso, connect() falla con el mensaje de error de abajo.
const CJNOA_AGENT_ID = process.env.NEXT_PUBLIC_CJNOA_AGENT_ID;

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

  return { messages, status, errorMessage, connect, sendMessage };
}
