"use client"

/**
 * Layout tipo WhatsApp Web (rail de íconos + lista de chats + conversación)
 * para probar por texto el agente real de Centro Jurídico NOA. Un solo
 * "contacto" real (el agente, sin datos de ejemplo), conectado vía
 * hooks/use-cjnoa-agent-conversation.ts a la sesión real de @11labs/client
 * (el agent_id vive ahí, no acá).
 *
 * El rail de íconos de la izquierda se arma a mano (no con el componente
 * Sidebar de shadcn): ese componente usa position:fixed + h-svh por dentro,
 * pensado para ocupar toda la altura de la página, y acá vive metido en una
 * caja acotada a 70vh — con él, todo el layout se estiraba a la altura
 * completa de la pantalla y el campo de texto quedaba inalcanzable. Un
 * div simple con flexbox dropea esa restricción sin perder el look.
 *
 * Los íconos de video/llamada/búsqueda/emoji/adjuntar/micrófono son parte
 * del chrome visual de WhatsApp — no hay backend de video ni de archivos
 * acá, así que quedan deshabilitados (visibles, pero no clickeables) en
 * vez de simular una función que no existe.
 */

import * as React from "react"
import {
  Menu,
  MessageCircle,
  Phone,
  CircleDot,
  Settings,
  SquarePen,
  ListFilter,
  Search,
  Video,
  Smile,
  Paperclip,
  Mic,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardDescription, CardTitle } from "@/components/ui/card"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group"
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

// Rail de íconos de la izquierda, al estilo WhatsApp Web / Desktop.
// Decorativo: en esta app de un solo contacto no hay otras vistas a las
// que navegar, pero visualmente completa el layout de referencia.
function IconRail() {
  return (
    <div className="hidden w-16 shrink-0 flex-col items-center gap-1 border-r py-4 md:flex">
      <Button variant="ghost" size="icon" disabled title="Navegar">
        <Menu className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="bg-accent text-primary"
        disabled
        title="Mensajes"
      >
        <MessageCircle className="size-5" />
      </Button>
      <Button variant="ghost" size="icon" disabled title="Llamadas">
        <Phone className="size-5" />
      </Button>
      <Button variant="ghost" size="icon" disabled title="Estados">
        <CircleDot className="size-5" />
      </Button>
      <div className="flex-1" />
      <Button variant="ghost" size="icon" disabled title="Configuración">
        <Settings className="size-5" />
      </Button>
      <Avatar className="size-8" title="Acceso: Diego / Rodrigo">
        <AvatarFallback>
          <ShieldCheck className="size-4" />
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

export const Home = () => {
  const { messages, status, errorMessage, connect, disconnect, sendMessage } =
    useCJNoaAgentConversation()

  React.useEffect(() => {
    // Entorno de prueba de dos personas: conecta solo, sin botón extra de
    // "iniciar chat".
    connect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = (event: ChatSubmitEvent) => {
    sendMessage(event.message)
  }

  return (
    <div className="flex h-full">
      <IconRail />

      <ResizablePanelGroup direction="horizontal" className="h-full flex-1">
        {/* Left Panel - único contacto (sin lista de ejemplo) */}
        <ResizablePanel
          defaultSize={26}
          minSize={20}
          maxSize={34}
          className="hidden md:block"
        >
          <div className="flex h-full flex-col border-r">
            <div className="flex h-14 items-center justify-between px-4">
              <p className="text-base font-semibold">Chats</p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" disabled title="Chat nuevo">
                  <SquarePen className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled title="Filtrar">
                  <ListFilter className="size-4" />
                </Button>
              </div>
            </div>
            <div className="px-3 pb-2">
              <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-muted-foreground">
                <Search className="size-4" />
                <span className="text-sm">Buscar</span>
              </div>
            </div>
            <div className="flex w-full items-center gap-3 border-t px-4 py-3 text-left">
              <Avatar className="size-11">
                {AGENT_CONTACT.image && (
                  <AvatarImage src={AGENT_CONTACT.image} />
                )}
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
        </ResizablePanel>

        <ResizableHandle className="hidden md:flex" />

        {/* Right Panel - conversación real */}
        <ResizablePanel defaultSize={74} minSize={50}>
          <div className="flex h-full flex-col">
            {/* Chat Header */}
            <div className="flex h-14 items-center gap-3 border-b px-4">
              <Avatar className="size-9 md:hidden">
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
                <Button variant="ghost" size="icon-sm" disabled title="Videollamada">
                  <Video className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled title="Llamada">
                  <Phone className="size-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled title="Buscar en la conversación">
                  <Search className="size-4" />
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

            {/* Conversación */}
            <div className="min-h-0 flex-1 p-3">
              <Chat onSubmit={handleSubmit}>
                <div className="flex h-full min-h-0 flex-col gap-3">
                  <ChatViewport className="min-h-0 flex-1">
                    <ChatMessages>
                      {messages.length === 0 && (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          {status === "connected"
                            ? "Escribí un mensaje para empezar a probar el agente."
                            : "Conectando con el agente…"}
                        </p>
                      )}
                      {messages.map((message) => (
                        <ChatMessageRow
                          key={message.id}
                          variant={message.role === "user" ? "self" : "peer"}
                        >
                          <ChatMessageAvatar
                            fallback={message.role === "user" ? "Vos" : "CJ"}
                          />
                          <ChatMessageBubble>
                            {message.text}
                          </ChatMessageBubble>
                          <ChatMessageTime dateTime={message.createdAt} />
                        </ChatMessageRow>
                      ))}
                    </ChatMessages>
                  </ChatViewport>

                  <ChatInputArea>
                    <InputGroupAddon align="inline-start">
                      <InputGroupButton disabled title="Emoji">
                        <Smile className="size-4" />
                      </InputGroupButton>
                      <InputGroupButton disabled title="Adjuntar">
                        <Paperclip className="size-4" />
                      </InputGroupButton>
                    </InputGroupAddon>
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
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton disabled title="Mensaje de voz">
                        <Mic className="size-4" />
                      </InputGroupButton>
                    </InputGroupAddon>
                  </ChatInputArea>
                </div>
              </Chat>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
