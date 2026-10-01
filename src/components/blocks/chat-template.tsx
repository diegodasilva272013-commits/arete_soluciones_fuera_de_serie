"use client"

/**
 * Layout tipo WhatsApp Web (rail de navegación + lista de chats +
 * conversación) para probar por texto — y opcionalmente por voz — al
 * agente real de Centro Jurídico NOA. Un solo contacto real (el agente),
 * conectado vía hooks/use-cjnoa-agent-conversation.ts a la sesión real
 * de @11labs/client (el agent_id vive ahí, no acá).
 *
 * Todo el chrome visual de WhatsApp está acá (rail, pencil/filtro,
 * buscador de chats, video/llamada en el header, emoji/adjuntar en el
 * input), pero como no hay backend real de video, llamadas tradicionales,
 * archivos ni notas de voz en este entorno de prueba, esos botones no
 * fingen una función que no existe: al tocarlos avisan con un popover
 * "No disponible en este entorno de prueba" en vez de quedarse mudos.
 * Lo que sí es 100% real:
 *   - Buscar dentro de los mensajes de la conversación actual.
 *   - Activar voz: la sesión con el agente YA es de voz por dentro
 *     (@11labs/client) — este botón dejar de silenciar el micrófono y
 *     el audio de salida, para poder hablarle además de escribirle.
 *   - Cortar / reintentar la conexión, enviar mensajes.
 *
 * El rail es un div flex simple, no el componente Sidebar de shadcn:
 * ese usa position:fixed + h-svh por dentro (pensado para ocupar toda
 * la altura de la página) y acá vive en una caja acotada a 70vh — con
 * él, el layout se estiraba a la altura completa de la pantalla y el
 * campo de texto quedaba inalcanzable.
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
  MicOff,
  ShieldCheck,
  X,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardDescription, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

// Botón de chrome WhatsApp sin backend real acá (video, llamada, archivos,
// emoji, notas de voz, etc.): en vez de quedarse mudo al tocarlo, avisa
// con un popover que se cierra solo. Honesto en vez de fingir.
function ChromeIconButton({
  icon: Icon,
  label,
  size = "icon-sm",
  className,
}: {
  icon: LucideIcon
  label: string
  size?: "icon" | "icon-sm"
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const t = setTimeout(() => setOpen(false), 1800)
    return () => clearTimeout(t)
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          className={className}
          onClick={() => setOpen(true)}
          title={label}
        >
          <Icon className={size === "icon" ? "size-5" : "size-4"} />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-auto px-3 py-1.5 text-xs">
        No disponible en este entorno de prueba
      </PopoverContent>
    </Popover>
  )
}

// Rail de navegación, al estilo WhatsApp Web/Desktop. "Mensajes" es la
// única vista real de esta app (de ahí que quede marcada como activa);
// el resto es chrome — ver ChromeIconButton.
function NavRail() {
  return (
    <div className="hidden w-16 shrink-0 flex-col items-center gap-1 border-r py-4 md:flex">
      <ChromeIconButton icon={Menu} label="Navegar" size="icon" />
      <Button
        variant="ghost"
        size="icon"
        className="bg-accent text-primary"
        title="Mensajes"
      >
        <MessageCircle className="size-5" />
      </Button>
      <ChromeIconButton icon={Phone} label="Llamadas" size="icon" />
      <ChromeIconButton icon={CircleDot} label="Estados" size="icon" />
      <div className="flex-1" />
      <ChromeIconButton icon={Settings} label="Configuración" size="icon" />
      <Avatar className="size-8" title="Acceso: Diego / Rodrigo">
        <AvatarFallback>
          <ShieldCheck className="size-4" />
        </AvatarFallback>
      </Avatar>
    </div>
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

  return (
    <div className="flex h-full">
      <NavRail />

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
                <ChromeIconButton icon={SquarePen} label="Chat nuevo" />
                <ChromeIconButton icon={ListFilter} label="Filtrar" />
              </div>
            </div>
            <div className="px-3 pb-2">
              <ChromeFakeSearch />
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
                <ChromeIconButton icon={Video} label="Videollamada" />
                <ChromeIconButton icon={Phone} label="Llamada" />
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
                    {visibleMessages.length} resultado
                    {visibleMessages.length === 1 ? "" : "s"}
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
                Voz activada — hablale al agente, también podés seguir
                escribiendo.
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
                    <div className="flex items-center gap-0.5 pl-1">
                      <ChromeIconButton icon={Smile} label="Emoji" />
                      <ChromeIconButton icon={Paperclip} label="Adjuntar" />
                    </div>
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
                    <div className="flex items-center gap-0.5 pr-1">
                      <ChromeIconButton icon={Mic} label="Nota de voz" />
                    </div>
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

// "Buscar o iniciar chat nuevo" de la lista de chats: con un solo
// contacto no hay nada que buscar/filtrar ahí, así que es el mismo
// aviso honesto al tocarlo en vez de un input que no filtra nada.
function ChromeFakeSearch() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    const t = setTimeout(() => setOpen(false), 1800)
    return () => clearTimeout(t)
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-md border px-3 py-1.5 text-left text-muted-foreground"
        >
          <Search className="size-4" />
          <span className="text-sm">Buscar o iniciar chat nuevo</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-auto px-3 py-1.5 text-xs">
        No disponible en este entorno de prueba — solo hay un contacto.
      </PopoverContent>
    </Popover>
  )
}
