"use client"

/**
 * Layout tipo WhatsApp (Sidebar + panel de conversación redimensionable)
 * para probar por texto el agente real de Centro Jurídico NOA. Un solo
 * "contacto" (el agente, sin datos de ejemplo), conectado vía
 * hooks/use-cjnoa-agent-conversation.ts a la sesión real de @11labs/client
 * (el agent_id vive ahí, no acá).
 */

import * as React from "react"
import { Menu, MessageCircle, ShieldCheck } from "lucide-react"

import {
  SidebarInset,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/blocks/sidebar"
import { Button } from "@/components/ui/button"
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

const menuItems = [{ title: "Chat CJ NOA", url: "#", icon: MessageCircle }]

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
  const { toggleSidebar } = useSidebar()
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
    <>
      {/* Sidebar */}
      <Sidebar variant="floating" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegar</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={toggleSidebar} asChild>
                    <span>
                      <Menu />
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton disabled>
                <ShieldCheck /> Acceso: Diego / Rodrigo
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <SidebarInset>
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - único contacto (sin lista de ejemplo) */}
          <ResizablePanel
            defaultSize={26}
            minSize={20}
            maxSize={34}
            className="hidden md:block"
          >
            <div className="flex h-full flex-col border-r">
              <div className="flex h-14 items-center px-4">
                <p className="text-sm font-medium">Chats</p>
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
                  <p className="ml-auto max-w-64 truncate text-xs text-red-500">
                    {errorMessage}
                  </p>
                )}
                {status === "connected" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-red-500 hover:text-red-400"
                    onClick={() => disconnect()}
                  >
                    Cortar
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={status === "error" ? "ml-2" : "ml-auto"}
                    onClick={() => connect()}
                  >
                    {status === "error" ? "Reintentar" : "Reintentar conexión"}
                  </Button>
                )}
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </SidebarInset>
    </>
  )
}
