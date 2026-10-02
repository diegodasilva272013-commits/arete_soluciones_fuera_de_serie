'use client';

import { useCallback, useRef, useState } from 'react';
import { Conversation } from '@11labs/client';

// Agente dedicado de Centro Jurídico NOA para esta integración (jubilaciones,
// Data Collection, webhooks) — el mismo que atiende por WhatsApp real en
// /api/webhooks/cjnoa-whatsapp, no el agente de demo genérico de
// /empresa/agentes-ia. Se puede pisar con NEXT_PUBLIC_CJNOA_AGENT_ID.
const CJNOA_AGENT_ID =
  process.env.NEXT_PUBLIC_CJNOA_AGENT_ID || 'agent_3901m3sxk6qfe9mb39bp7ddbenpn';

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
  const [voiceEnabled, setVoiceEnabled] = useState(false);

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
      // Arranca en modo texto: mic y audio de salida silenciados. El
      // botón de micrófono de la UI llama a toggleVoice() para activar
      // los dos juntos y poder hablarle al agente de verdad.
      conv.setMicMuted(!voiceEnabled);
      conv.setVolume({ volume: voiceEnabled ? 1 : 0 });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo conectar con el agente.');
    }
  }, [status, addMessage, voiceEnabled]);

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

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      const conv = convRef.current;
      if (conv) {
        conv.setMicMuted(!next);
        conv.setVolume({ volume: next ? 1 : 0 });
      }
      return next;
    });
  }, []);

  return {
    messages,
    status,
    errorMessage,
    connect,
    disconnect,
    sendMessage,
    voiceEnabled,
    toggleVoice,
  };
}
