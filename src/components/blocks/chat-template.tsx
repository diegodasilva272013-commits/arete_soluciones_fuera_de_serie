"use client"

/**
 * Layout tipo WhatsApp Web (lista de chats + conversación) para probar
 * por texto — y opcionalmente por voz — al agente real de Centro
 * Jurídico NOA. Un solo contacto real (el agente), conectado vía
 * hooks/use-cjnoa-agent-conversation.ts a la sesión real de @11labs/client
 * (el agent_id vive ahí, no acá).
 *
 * Cada ícono que se ve acá hace lo que dice: no hay chrome decorativo
 * sin backend. Por eso no hay botones de videollamada, llamada de voz
 * tradicional, adjuntar archivo ni emoji — no hay nada detrás de esos
 * en este entorno. Lo que sí es real:
 *   - Mostrar/ocultar la lista de chats (más lugar para la conversación).
 *   - Buscar dentro de los mensajes de la conversación actual.
 *   - Activar voz: la sesión con el agente YA es de voz por dentro
 *     (@11labs/client) — este botón simplemente deja de silenciar el
 *     micrófono y el audio de salida, así se lo puede probar hablando
 *     además de escribiendo.
 *   - Cortar / reintentar la conexión.
 */

import * as React from "react"
import { Menu, Search, Mic, MicOff, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardDescription, CardTitle } from "@/components/ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Chat,
  ChatViewport,
  ChatMessages,
  ChatMessageRow,
  ChatMessageAvatar,
  ChatMessageBubble,
  ChatMessageTime,
  ChatInputArea,
  ChatInputField,
  ChatInputSubmit,
} from "@/components/ui/chat"
import type { ChatSubmitEvent } from "@/components/ui/chat"

import {
  useCJNoaAgentConversation,
  type CJNoaConnectionStatus,
} from "@/hooks/use-cjnoa-agent-conversation"

const AGENT_CONTACT = {
  name: "Agente CJ NOA",
  subtitle: "Centro Jurídico NOA · WhatsApp (prueba)",
  image: undefined as string | undefined,
}

function EstadoConexion({ status }: { status: CJNoaConnectionStatus }) {
  const label =
    status === "connected"
      ? "Conectado"
      : status === "connecting"
        ? "Conectando…"
        : status === "error"
          ? "Error de conexión"
          : "Desconectado"

  const dotClass =
    status === "connected"
      ? "bg-emerald-500"
      : status === "connecting"
        ? "bg-amber-500"
        : status === "error"
          ? "bg-red-500"
          : "bg-muted-foreground"

  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`size-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  )
}

export const Home = () => {
  const {
    messages,
    status,
    errorMessage,
    connect,
    disconnect,
    sendMessage,
    voiceEnabled,
    toggleVoice,
  } = useCJNoaAgentConversation()

  const [showContacts, setShowContacts] = React.useState(true)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    // Entorno de prueba de dos personas: conecta solo, sin botón extra de
    // "iniciar chat".
    connect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (event: ChatSubmitEvent) => {
    sendMessage(event.message)
  }

  const visibleMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.text.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : messages

  const contactsPanel = (
    <div className="flex h-full flex-col border-r">
      <div className="flex h-14 items-center px-4">
        <p className="text-base font-semibold">Chats</p>
      </div>
      <div className="flex w-full items-center gap-3 border-t px-4 py-3 text-left">
        <Avatar className="size-11">
          {AGENT_CONTACT.image && <AvatarImage src={AGENT_CONTACT.image} />}
          <AvatarFallback>CJ</AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <CardTitle className="truncate text-sm">
            {AGENT_CONTACT.name}
          </CardTitle>
          <CardDescription className="truncate text-xs">
            {AGENT_CONTACT.subtitle}
          </CardDescription>
        </div>
        <div className="ml-auto shrink-0">
          <EstadoConexion status={status} />
        </div>
      </div>
    </div>
  )

  const conversationPanel = (
    <div className="flex h-full flex-col">
      {/* Chat Header */}
      <div className="flex h-14 items-center gap-3 border-b px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowContacts((v) => !v)}
          title={showContacts ? "Ocultar lista de chats" : "Mostrar lista de chats"}
        >
          <Menu className="size-4" />
        </Button>
        <Avatar className="size-9">
          <AvatarFallback>CJ</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <CardTitle className="truncate text-sm">
            {AGENT_CONTACT.name}
          </CardTitle>
          <EstadoConexion status={status} />
        </div>
        {status === "error" && errorMessage && (
          <p className="ml-4 max-w-64 truncate text-xs text-red-500">
            {errorMessage}
          </p>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={searchOpen ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => {
              setSearchOpen((v) => !v)
              setSearchQuery("")
            }}
            title="Buscar en la conversación"
          >
            <Search className="size-4" />
          </Button>
          <Button
            variant={voiceEnabled ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => toggleVoice()}
            disabled={status !== "connected"}
            title={
              voiceEnabled
                ? "Desactivar voz (volver a modo texto)"
                : "Activar voz: hablarle al agente en vez de escribir"
            }
          >
            {voiceEnabled ? (
              <Mic className="size-4 text-primary" />
            ) : (
              <MicOff className="size-4" />
            )}
          </Button>
          {status === "connected" ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-400"
              onClick={() => disconnect()}
            >
              Cortar
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => connect()}>
              {status === "error" ? "Reintentar" : "Reintentar conexión"}
            </Button>
          )}
        </div>
      </div>

      {searchOpen && (
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en los mensajes de esta conversación…"
            className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          {searchQuery && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {visibleMessages.length} resultado{visibleMessages.length === 1 ? "" : "s"}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setSearchOpen(false)
              setSearchQuery("")
            }}
            title="Cerrar búsqueda"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}

      {voiceEnabled && (
        <p className="border-b bg-primary/5 px-4 py-1.5 text-center text-xs text-primary">
          Voz activada — hablale al agente, también podés seguir escribiendo.
        </p>
      )}

      {/* Conversación */}
      <div className="min-h-0 flex-1 p-3">
        <Chat onSubmit={handleSubmit}>
          <div className="flex h-full min-h-0 flex-col gap-3">
            <ChatViewport className="min-h-0 flex-1">
              <ChatMessages>
                {visibleMessages.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {searchQuery
                      ? "Sin resultados para esa búsqueda."
                      : status === "connected"
                        ? "Escribí un mensaje para empezar a probar el agente."
                        : "Conectando con el agente…"}
                  </p>
                )}
                {visibleMessages.map((message) => (
                  <ChatMessageRow
                    key={message.id}
                    variant={message.role === "user" ? "self" : "peer"}
                  >
                    <ChatMessageAvatar
                      fallback={message.role === "user" ? "Vos" : "CJ"}
                    />
                    <ChatMessageBubble>{message.text}</ChatMessageBubble>
                    <ChatMessageTime dateTime={message.createdAt} />
                  </ChatMessageRow>
                ))}
              </ChatMessages>
            </ChatViewport>

            <ChatInputArea>
              <ChatInputField
                multiline={false}
                placeholder={
                  status === "connected"
                    ? "Escribí como si fueras un consultante por WhatsApp…"
                    : "Esperando conexión con el agente…"
                }
                disabled={status !== "connected"}
              />
              <ChatInputSubmit disabled={status !== "connected"} />
            </ChatInputArea>
          </div>
        </Chat>
      </div>
    </div>
  )

  if (!showContacts) {
    return <div className="h-full">{conversationPanel}</div>
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel
        defaultSize={26}
        minSize={20}
        maxSize={34}
        className="hidden md:block"
      >
        {contactsPanel}
      </ResizablePanel>

      <ResizableHandle className="hidden md:flex" />

      <ResizablePanel defaultSize={74} minSize={50}>
        {conversationPanel}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
