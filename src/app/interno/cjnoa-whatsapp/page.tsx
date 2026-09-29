import type { Metadata } from "next"

import { Home as CJNoaChatWindow } from "@/components/blocks/chat-template"
import { hasValidCJNoaSession } from "@/lib/cjnoa-access"
import { CJNoaAccessGate } from "./access-gate"

// No indexar ni cachear esta ruta — es interna, solo para Diego y Rodrigo.
export const metadata: Metadata = {
  title: "CJ NOA — entorno de prueba | Areté Soluciones",
  robots: { index: false, follow: false, nocache: true },
}

const RAMAS = [
  "Impuesto a las Ganancias",
  "Tope del Art. 9",
  "Tope por Acumulación",
  "Reajuste de Haberes",
  "Jubilación / Pensión por Fallecimiento",
]

const PRIMEROS_MENSAJES = [
  {
    rama: "Ganancias",
    mensaje: "me descuentan impuesto a las ganancias de la jubilación",
  },
  {
    rama: "Tope Art. 9",
    mensaje: "quiero reclamar por el tope del artículo 9",
  },
  { rama: "Reajuste", mensaje: "quiero consultar por reajuste de haberes" },
  {
    rama: "Jubilación",
    mensaje: "quiero iniciar el trámite de mi jubilación, vivo en Jujuy",
  },
  {
    rama: "Pensión",
    mensaje: "quiero tramitar la pensión por fallecimiento de mi esposo",
  },
  { rama: "Fuera de tema", mensaje: "quiero consultar por un divorcio" },
]

const QUE_FIJARSE = [
  "Nunca da montos exactos de honorarios, aunque insistas.",
  "Si mencionás más de un beneficio cobrando, tiene que reencauzar a Tope por Acumulación.",
  "En Reajuste, no ofrece turno de una — explica el informe Jáuregui primero.",
  "Si te hacés pasar por la parte contraria de un caso, corta y deriva, sin pedir datos.",
  "No debería inventar horarios de agenda concretos todavía.",
]

// Ver clientes/cjnoa-whatsapp/ en el proyecto para el detalle completo de
// cada rama — este contenido es referencia rápida, no reemplaza esa KB.

export default async function CJNoaWhatsAppTestPage() {
  const hasAccess = await hasValidCJNoaSession()

  if (!hasAccess) {
    return <CJNoaAccessGate />
  }

  return (
    <div className="min-h-svh bg-[#050505] text-[#F2EFE9]">
      {/* Hero */}
      <header className="border-b border-[#8A8A8A]/20 px-6 py-10 md:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#2F7BF6]">
          Areté Soluciones · Centro Jurídico NOA
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold md:text-4xl">
          Entorno privado de prueba del agente real
        </h1>
        <p className="mt-3 max-w-2xl text-[#8A8A8A]">
          Es el mismo agente que va a atender por WhatsApp — un solo cerebro
          que clasifica las 5 ramas dinámicamente. No es una simulación
          aparte: lo que respondé acá es lo que va a responder en los 3
          números reales.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {RAMAS.map((r) => (
            <span
              key={r}
              className="border border-[#2F7BF6]/40 px-3 py-1 font-mono text-xs text-[#2F7BF6]"
              style={{
                clipPath:
                  "polygon(0 6px, 6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              {r}
            </span>
          ))}
        </div>
      </header>

      {/* Chat */}
      <main className="px-6 py-8 md:px-10">
        <div
          className="h-[70vh] min-h-[560px] overflow-hidden border border-[#8A8A8A]/20"
          style={{
            clipPath:
              "polygon(0 16px, 16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
          }}
        >
          <CJNoaChatWindow />
        </div>

        {/* Guía rápida de testeo — texto sacado de clientes/cjnoa-whatsapp/ */}
        <section className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2F7BF6]">
              Primeros mensajes para probar
            </h2>
            <ul className="mt-4 space-y-3">
              {PRIMEROS_MENSAJES.map((m) => (
                <li
                  key={m.rama}
                  className="border-l-2 border-[#2F7BF6]/40 pl-3"
                >
                  <p className="font-mono text-xs uppercase text-[#8A8A8A]">
                    {m.rama}
                  </p>
                  <p className="text-[#F2EFE9]">&ldquo;{m.mensaje}&rdquo;</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#2F7BF6]">
              Qué fijarse
            </h2>
            <ul className="mt-4 space-y-3">
              {QUE_FIJARSE.map((q) => (
                <li key={q} className="flex gap-2 text-[#F2EFE9]">
                  <span className="text-[#2F7BF6]">→</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}
