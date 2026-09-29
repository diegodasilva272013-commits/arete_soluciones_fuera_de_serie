"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { verifyCJNoaPassword, type CJNoaAccessState } from "./actions"

const initialState: CJNoaAccessState = { error: null }

export function CJNoaAccessGate() {
  const router = useRouter()

  const [state, formAction, isPending] = useActionState(
    async (prevState: CJNoaAccessState, formData: FormData) => {
      const result = await verifyCJNoaPassword(prevState, formData)
      if (!result.error) {
        // La cookie ya está seteada del lado del servidor — refrescamos
        // para que la page.tsx (server component) vuelva a leerla y
        // muestre el chat en vez del gate.
        router.refresh()
      }
      return result
    },
    initialState,
  )

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#050505] px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-5 border border-[#8A8A8A]/30 bg-[#0a0a0a] p-8"
        style={{
          clipPath:
            "polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
        }}
      >
        <div className="space-y-1 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F7BF6]">
            Areté Soluciones · Acceso interno
          </p>
          <h1 className="text-lg font-semibold text-[#F2EFE9]">
            Agente CJ NOA — entorno de prueba
          </h1>
        </div>

        <div className="space-y-2">
          <Input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            autoFocus
            className="border-[#8A8A8A]/40 bg-transparent text-[#F2EFE9] placeholder:text-[#8A8A8A]"
          />
          {state.error && (
            <p className="text-sm text-red-400">{state.error}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#2F7BF6] text-[#050505] hover:bg-[#2F7BF6]/90"
        >
          {isPending ? "Verificando…" : "Entrar"}
        </Button>
      </form>
    </div>
  )
}
