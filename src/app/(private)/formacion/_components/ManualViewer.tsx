'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronRight, ChevronLeft, AlertTriangle, Target,
  Brain, Zap, Eye, Shield, Award, ArrowRight, CheckCircle2,
  BookOpen, MessageSquare,
} from 'lucide-react';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Callout = { type: 'dominio' | 'error'; text: string };
type Section = {
  id: string;
  number?: string;
  title: string;
  subtitle?: string;
  body: React.ReactNode;
  callouts?: Callout[];
};
type Chapter = {
  id: string;
  label: string;
  short: string;
  icon: React.ReactNode;
  color: string;
  sections: Section[];
};
type Manual = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  chapters: Chapter[];
};

// ─── MANUAL 01 ────────────────────────────────────────────────────────────────

const M01: Manual = {
  id: 'm01',
  number: '01',
  title: 'Fundamentos de la Conversación Comercial',
  subtitle: 'La base técnica de toda comunicación efectiva',
  description: 'Antes de técnicas de cierre, antes de objeciones, antes de cualquier táctica — existe una capa más profunda: cómo funciona realmente la comunicación humana en un contexto comercial.',
  chapters: [
    {
      id: 'principio',
      label: 'Principio',
      short: 'Principio',
      icon: <Zap className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'p1',
          title: 'El principio que lo cambia todo',
          body: (
            <div className="space-y-5">
              <p className="text-xl leading-relaxed text-brand-text font-medium">
                Una llamada comercial <span className="text-brand-gold">no es un evento</span>. Es el resultado de un proceso.
              </p>
              <p className="leading-relaxed text-brand-muted">
                Lo que pasa antes, durante y después de la conversación determina si cerrás o no. La mayoría de los vendedores creen que la habilidad de vender está en lo que dicen. En realidad, está en cómo escuchan, cómo crean contexto y cómo se posicionan mentalmente antes de abrir la boca.
              </p>
              <p className="leading-relaxed text-brand-muted">
                Este manual te entrena en los fundamentos invisibles que separan a un vendedor promedio de uno que cierra en frío, con extraños, en 30 minutos.
              </p>
            </div>
          ),
        },
      ],
    },
    {
      id: 'bloque01',
      label: 'Bloque 01',
      short: 'La llamada',
      icon: <MessageSquare className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'b01c01',
          number: '01',
          title: 'La conversación',
          subtitle: 'No es un monólogo con público',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Una conversación comercial es un intercambio de información con un objetivo. No es un discurso, no es una presentación. Es un proceso de dos vías donde el vendedor <span className="text-brand-gold font-medium">dirige sin imponer</span>.</p>
              <p className="leading-relaxed text-brand-muted">El error más común: llegar a hablar <em>sobre</em> el producto en lugar de hablar <em>con</em> la persona. El que más habla, más cierra — es un mito. El que más escucha con intención, cierra.</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {['Toda conversación tiene un emisor y un receptor activos','El operador guía sin dominar','El objetivo no es convencer, es hacer descubrir','Una conversación sin intercambio real es un discurso'].map(p => (
                  <div key={p} className="flex items-start gap-3 rounded-xl bg-[#0d0d14] border border-[rgba(26,111,255,0.12)] p-4">
                    <ArrowRight className="h-4 w-4 text-brand-gold mt-0.5 shrink-0" />
                    <span className="text-sm text-brand-muted">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo distinguir entre una conversación de intercambio real y un monólogo disfrazado de llamada.' },
            { type: 'error', text: 'Hablar más del 60% del tiempo en la primera mitad de la llamada. Si eso pasa, no hay conversación — hay presentación.' },
          ],
        },
        {
          id: 'b01c02',
          number: '02',
          title: 'El punto en común',
          subtitle: 'El terreno donde todo se construye',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Antes de ir a cualquier solución, necesitás establecer un <span className="text-brand-gold font-medium">punto en común</span>: algo que vos y el prospecto ven igual. Sin eso, hablás en idiomas distintos.</p>
              <p className="leading-relaxed text-brand-muted">El punto en común no es "me caés bien". Es un acuerdo sobre la realidad del prospecto. Cuando ese acuerdo existe, la conversación fluye porque ambos están parados en el mismo piso.</p>
              <div className="rounded-2xl bg-gradient-to-br from-[#0f1a2e] to-[#080810] border border-[rgba(26,111,255,0.20)] p-5 mt-2">
                <p className="text-sm font-semibold text-brand-gold mb-3">Cómo se construye:</p>
                <ol className="space-y-2">
                  {['Escuchás activamente (sin pensar en qué vas a decir)','Reflejás lo que dijeron con sus propias palabras','Confirmás que lo entendiste bien antes de avanzar','Recién ahí avanzás al siguiente punto'].map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-brand-muted">
                      <span className="text-brand-gold font-bold shrink-0 w-5">{i + 1}.</span>{s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Antes de presentar cualquier solución, puedo articular exactamente qué situación tiene el prospecto y qué quiere cambiar, con sus propias palabras.' },
            { type: 'error', text: 'Saltar a la solución antes de tener un punto en común establecido. El prospecto siente que no lo entendés y cierra.' },
          ],
        },
        {
          id: 'b01c03',
          number: '03',
          title: 'El interés',
          subtitle: 'Sin interés no hay conversación posible',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Hay dos tipos: el <span className="text-brand-gold font-medium">interés declarado</span> (lo que dicen que quieren) y el <span className="text-brand-gold font-medium">interés real</span> (lo que en verdad los mueve). El vendedor amateur trabaja el declarado. El vendedor élite descubre el real.</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: 'Interés declarado', text: '"Quiero ganar más dinero"', dim: true },
                  { label: 'Interés real', text: '"Quiero dejar de sentirme en el límite cada mes"', dim: false },
                ].map(c => (
                  <div key={c.label} className={cn('rounded-xl border p-4', c.dim ? 'bg-[#0d0d0d] border-[rgba(255,255,255,0.06)]' : 'bg-[#0f1a2e] border-[rgba(26,111,255,0.25)]')}>
                    <p className={cn('text-xs font-semibold mb-2', c.dim ? 'text-brand-muted' : 'text-brand-gold')}>{c.label}</p>
                    <p className="text-sm text-brand-text italic">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo identificar la diferencia entre lo que el prospecto dice que quiere y lo que realmente lo moviliza emocionalmente.' },
            { type: 'error', text: 'Trabajar solo con el interés declarado. Terminás hablando de funcionalidades cuando el prospecto necesita sentir que su problema tiene solución.' },
          ],
        },
      ],
    },
    {
      id: 'bloque02',
      label: 'Bloque 02',
      short: 'Información',
      icon: <Zap className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'b02c04', number: '04', title: 'Emisor / receptor / canal', subtitle: 'El modelo básico que todos ignoran',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Todo mensaje tiene tres elementos: quien lo envía (emisor), quien lo recibe (receptor), y el medio por donde viaja (canal). En una llamada comercial, el canal es la voz + las palabras. Y cada elemento puede <span className="text-brand-gold font-medium">distorsionar el mensaje</span>.</p>
              <div className="flex items-center justify-center gap-4 my-6">
                {['Emisor', 'Canal', 'Receptor'].map((e, i) => (
                  <div key={e} className="flex items-center gap-4">
                    {i > 0 && <ArrowRight className="h-5 w-5 text-brand-gold" />}
                    <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.25)] rounded-xl px-5 py-3 text-center">
                      <p className="text-sm font-semibold text-brand-gold">{e}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="leading-relaxed text-brand-muted">Lo que vos emitís no es exactamente lo que el otro recibe. Por eso la claridad, el ritmo y la confirmación son herramientas técnicas, no estilos de comunicación.</p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Soy consciente de que lo que digo y lo que el prospecto escucha son dos cosas distintas. Tengo hábitos para reducir esa brecha.' },
            { type: 'error', text: 'Asumir que porque dijiste algo, el otro lo entendió como vos quisiste.' },
          ],
        },
        {
          id: 'b02c05', number: '05', title: 'La sintonía', subtitle: 'El estado que hace posible la influencia',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">La sintonía es el estado en que el prospecto <span className="text-brand-gold font-medium">baja la guardia</span> y empieza a fluir naturalmente en la conversación. Sin sintonía, cada palabra que decís es procesada con filtro de desconfianza.</p>
              <div className="grid sm:grid-cols-3 gap-3 mt-4">
                {[
                  { t: 'Vocal', d: 'Ajustás tu tono y ritmo al del prospecto' },
                  { t: 'Emocional', d: 'Reconocés su estado sin contradecirlo' },
                  { t: 'Conceptual', d: 'Hablás desde su realidad, no la tuya' },
                ].map(s => (
                  <div key={s.t} className="rounded-xl bg-[#0d0d14] border border-[rgba(26,111,255,0.12)] p-4">
                    <p className="text-sm font-bold text-brand-gold mb-1">{s.t}</p>
                    <p className="text-xs text-brand-muted">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo identificar si hay o no sintonía en los primeros 3 minutos y sé qué hacer para crearla.' },
            { type: 'error', text: 'Intentar presentar o persuadir antes de crear sintonía. Es como querer bailar con alguien que todavía no te vio.' },
          ],
        },
        {
          id: 'b02c06', number: '06', title: 'Emisión involuntaria', subtitle: 'Lo que transmitís sin querer',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Emitís mensajes constantemente que no planeaste emitir. Tu tono cuando estás cansado. Tu velocidad cuando estás nervioso. La pausa antes de responder una objeción. Esos mensajes el prospecto los recibe y procesa.</p>
              <div className="rounded-2xl bg-[#1a0a0a] border border-[rgba(255,80,80,0.20)] p-5">
                <p className="text-sm font-semibold text-[#ff6b6b] mb-3">Señales de emisión negativa involuntaria:</p>
                <ul className="space-y-2">
                  {['Hablar demasiado rápido → ansiedad','Subir el tono al presentar precio → inseguridad','Usar "¿no?" al final de frases → necesidad de validación','Silencio incómodo después de objeciones → miedo'].map(s => (
                    <li key={s} className="text-sm text-brand-muted flex gap-2 items-start"><span className="text-[#ff6b6b] shrink-0">×</span>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo llegar a una llamada en un estado controlado y mantenerlo durante toda la conversación, independientemente de lo que pase.' },
            { type: 'error', text: 'Creer que el prospecto solo escucha tus palabras. Escucha todo: tono, ritmo, energía.' },
          ],
        },
      ],
    },
    {
      id: 'bloque03',
      label: 'Bloque 03',
      short: 'Percepción',
      icon: <Eye className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'b03c07', number: '07', title: 'Información y percepción', subtitle: 'La realidad que cada uno construye',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Cada persona interpreta la información a través de su historia, sus creencias y sus experiencias. No hay dos prospectos que procesen lo mismo de la misma forma. Lo que para vos es "obvio", para el otro puede ser irrelevante.</p>
              <p className="leading-relaxed text-brand-muted">Esto tiene una implicación directa: no existe un mensaje que funcione para todos. El trabajo del operador es <span className="text-brand-gold font-medium">diagnosticar cómo percibe el prospecto</span> antes de construir cualquier argumento.</p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Adapto mi forma de presentar la información según cómo percibe las cosas el prospecto, no según cómo yo las veo.' },
            { type: 'error', text: 'Hablar desde tu propia percepción. "Esto es un precio excelente" no significa nada si el prospecto tiene otra referencia.' },
          ],
        },
        {
          id: 'b03c08', number: '08', title: 'Los filtros', subtitle: 'Qué procesa el prospecto y qué descarta',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">El cerebro filtra constantemente. No procesa todo lo que recibe — selecciona lo que confirma sus creencias. Esto se llama <span className="text-brand-gold font-medium">sesgo de confirmación</span> y es tu mayor adversario en ventas.</p>
              <div className="space-y-3 mt-2">
                {[
                  { n: 'Filtro de creencia', d: 'Si cree que "esto no es para mí", va a buscar razones para confirmar eso' },
                  { n: 'Filtro de experiencia', d: 'Si tuvo una mala experiencia previa, va a interpretar todo con desconfianza' },
                  { n: 'Filtro de urgencia', d: 'Si no siente que su problema es urgente, no va a percibir la solución como valiosa' },
                ].map(f => (
                  <div key={f.n} className="rounded-xl bg-[#0f1a2e] border border-[rgba(26,111,255,0.15)] p-4">
                    <p className="text-sm font-semibold text-brand-gold">{f.n}</p>
                    <p className="text-sm text-brand-muted mt-1">{f.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Identifico los filtros principales del prospecto en los primeros minutos y los uso como mapa para construir la conversación.' },
            { type: 'error', text: 'Intentar convencer a alguien de lo contrario de lo que ya cree. No funciona — se cierra más.' },
          ],
        },
        {
          id: 'b03c09', number: '09', title: 'Preguntar vs asumir', subtitle: 'El hábito que más dinero cuesta',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">La mayoría de los errores de venta vienen de asumir. Asumir qué quiere el prospecto. Asumir qué lo frena. Asumir cuánto puede pagar. Cada asunción es un riesgo innecesario cuando la alternativa — preguntar — es gratis.</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="rounded-xl bg-[#1a0a0a] border border-[rgba(255,80,80,0.20)] p-4">
                  <p className="text-xs font-bold text-[#ff6b6b] mb-3">Asumir</p>
                  <div className="space-y-2 text-sm text-brand-muted">
                    <p className="italic">"Seguro le interesa la opción económica"</p>
                    <p className="italic">"Parece que el problema es el precio"</p>
                    <p className="italic">"Ya debe saber cómo funciona esto"</p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#0a1a0f] border border-[rgba(26,200,100,0.20)] p-4">
                  <p className="text-xs font-bold text-[#6bff8a] mb-3">Preguntar</p>
                  <div className="space-y-2 text-sm text-brand-muted">
                    <p className="italic">"¿Qué es lo más importante para vos?"</p>
                    <p className="italic">"¿Qué te genera más hesitación?"</p>
                    <p className="italic">"¿Tuviste experiencias previas en esto?"</p>
                  </div>
                </div>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'En toda mi conversación, no asumo nada que pueda preguntar. Cada acción está basada en información real del prospecto.' },
            { type: 'error', text: 'La pregunta que más se evita: "¿Por qué?" Preguntar el porqué de una hesitación da más información que cualquier argumento de cierre.' },
          ],
        },
      ],
    },
    {
      id: 'bloque04',
      label: 'Bloque 04',
      short: 'El operador',
      icon: <Shield className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'b04c10', number: '10', title: 'Los primeros segundos', subtitle: 'La ventana que no se repite',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Los primeros 7 segundos de cualquier conversación generan una impresión que el cerebro del prospecto tarda entre 10 y 20 minutos en modificar. Esa ventana determina si la persona está abierta o cerrada antes de que hayas dicho algo de valor.</p>
              <div className="rounded-2xl bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] p-5 mt-2">
                <p className="text-sm font-semibold text-brand-gold mb-4">Los 3 elementos de apertura:</p>
                <div className="space-y-3">
                  {[
                    { n: '1', t: 'Presencia', d: 'Llegás mentalmente presente, no pensando en la llamada anterior' },
                    { n: '2', t: 'Tono', d: 'Voz firme, calmada, con energía — sin ansiedad ni apuro' },
                    { n: '3', t: 'Marco', d: 'Establecés desde el inicio que esta es una conversación de diagnóstico, no de ventas' },
                  ].map(e => (
                    <div key={e.n} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-brand-gold">{e.n}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-brand-text">{e.t}</p>
                        <p className="text-xs text-brand-muted mt-0.5">{e.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Tengo un ritual pre-llamada que me garantiza llegar en estado óptimo a los primeros segundos.' },
            { type: 'error', text: 'Entrar a la llamada directo desde otra actividad, sin transición. El prospecto hereda tu estado anterior.' },
          ],
        },
        {
          id: 'b04c11', number: '11', title: 'Control del estado', subtitle: 'El activo más subestimado del vendedor',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Podés tener el mejor script del mundo, pero si estás ansioso, frustrado o en modo "necesito cerrar", el prospecto lo va a sentir — y va a reaccionar cerrándose. El control del estado no significa no sentir nada. Significa que tus emociones <span className="text-brand-gold font-medium">no conducen la conversación</span>.</p>
              <div className="space-y-2 mt-4">
                {[
                  { e: 'Ansiedad por cerrar', r: 'El prospecto siente presión → se cierra', bad: true },
                  { e: 'Miedo al "no"', r: 'Evitás las preguntas duras → perdés información', bad: true },
                  { e: 'Aburrimiento', r: 'Tu energía baja → la llamada pierde vida', bad: true },
                  { e: 'Estado neutro-curioso', r: 'Creás espacio → el prospecto se abre', bad: false },
                ].map(r => (
                  <div key={r.e} className={cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm border', r.bad ? 'bg-[#111] border-[rgba(255,255,255,0.04)]' : 'bg-[#0f1a2e] border-[rgba(26,111,255,0.25)]')}>
                    <span className={cn('font-semibold shrink-0', r.bad ? 'text-brand-muted' : 'text-brand-gold')}>{r.e}</span>
                    <span className="text-[#555]">→</span>
                    <span className="text-brand-muted">{r.r}</span>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo identificar mi estado emocional antes de cada llamada y tengo herramientas concretas para ajustarlo.' },
            { type: 'error', text: 'Hacer llamadas cuando estás en un estado negativo sin ningún ritual de reset. Contamina toda la conversación.' },
          ],
        },
        {
          id: 'b04c12', number: '12', title: 'El marco del solucionador', subtitle: 'La postura que genera autoridad real',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">El vendedor promedio opera desde el marco del vendedor: "necesito que compres". El operador élite opera desde el marco del solucionador: <span className="text-brand-gold font-medium">"estoy aquí para diagnosticar si puedo ayudarte"</span>.</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { marco: 'Vendedor', items: ['Necesito que compres','Evito las objeciones','El cierre es el objetivo','Mi éxito = que digan sí'], bad: true },
                  { marco: 'Solucionador', items: ['Diagnostico si puedo ayudarte','Las objeciones son información','El diagnóstico es el objetivo','Mi éxito = decisión correcta'], bad: false },
                ].map(m => (
                  <div key={m.marco} className={cn('rounded-xl border p-4', m.bad ? 'bg-[#1a0a0a] border-[rgba(255,80,80,0.20)]' : 'bg-[#0f1a2e] border-[rgba(26,111,255,0.25)]')}>
                    <p className={cn('text-sm font-bold mb-3', m.bad ? 'text-[#ff6b6b]' : 'text-brand-gold')}>Marco del {m.marco}</p>
                    <ul className="space-y-1.5">
                      {m.items.map(i => <li key={i} className="text-xs text-brand-muted flex gap-2"><span className={m.bad ? 'text-[#ff6b6b]' : 'text-brand-gold'}>•</span>{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'En toda mi conversación opero desde el marco del solucionador. Mis preguntas, mi tono y mis respuestas reflejan esa postura.' },
            { type: 'error', text: 'Volver al marco del vendedor cuando el prospecto duda. Es justamente cuando más necesitás mantenerte en el marco del solucionador.' },
          ],
        },
      ],
    },
    {
      id: 'cierre',
      label: 'Cierre',
      short: 'Cierre',
      icon: <Award className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'reglas01',
          title: 'Las 7 reglas transversales',
          body: (
            <div className="space-y-3">
              {[
                { n: 1, r: 'Escuchá para entender, no para responder', d: 'Mientras pensás en qué vas a decir, dejás de escuchar lo que el prospecto te está revelando.' },
                { n: 2, r: 'No asumas, preguntá', d: 'Cada asunción es un riesgo. Cada pregunta es información.' },
                { n: 3, r: 'El silencio es una herramienta', d: 'Después de una pregunta poderosa, callate. El prospecto llena el silencio — y lo que pone ahí es oro.' },
                { n: 4, r: 'Primero entiende, después habla de soluciones', d: 'No presentés nada hasta haber mapeado completamente el problema.' },
                { n: 5, r: 'El estado del operador es responsabilidad del operador', d: 'No es culpa del prospecto si la llamada salió mal porque llegaste en mal estado.' },
                { n: 6, r: 'Una objeción es una pregunta disfrazada', d: 'Nadie dice "es caro" porque quiere terminar la conversación. Quieren una razón para seguir.' },
                { n: 7, r: 'El cierre es consecuencia del diagnóstico', d: 'Si el diagnóstico fue real, el cierre es casi automático. Si se siente difícil, el problema estuvo antes.' },
              ].map(r => (
                <div key={r.n} className="flex gap-4 items-start rounded-2xl bg-[#0d0d14] border border-[rgba(26,111,255,0.10)] p-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-brand-gold">{r.n}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text">{r.r}</p>
                    <p className="text-sm text-brand-muted mt-1">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'tablero01',
          title: 'Tablero de dominio — 12 criterios',
          body: (
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                'Distingo entre conversación e intercambio real',
                'Establezco puntos en común antes de presentar',
                'Identifico el interés real vs el declarado',
                'Soy consciente del modelo emisor-canal-receptor',
                'Creo sintonía en los primeros 3 minutos',
                'Controlo mi emisión involuntaria',
                'Diagnostico cómo percibe el prospecto antes de argumentar',
                'Identifico los filtros principales del prospecto',
                'No asumo nada que pueda preguntar',
                'Domino mis primeros 7 segundos de llamada',
                'Controlo mi estado emocional independientemente del resultado',
                'Opero siempre desde el marco del solucionador',
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-[#0d0d0d] border border-[rgba(255,255,255,0.05)] px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-black text-brand-gold">{String(i+1).padStart(2,'0')}</span>
                  </div>
                  <p className="text-sm text-brand-muted">{c}</p>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'errores01',
          title: 'Errores que rompen la conversación',
          body: (
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { e: 'Hablar más del 60% del tiempo', c: 'El prospecto no siente que lo escuchaste.' },
                { e: 'Saltar al precio sin diagnóstico', c: 'No tiene contexto para evaluar si tiene sentido.' },
                { e: 'Responder objeciones con argumentos', c: 'Las objeciones necesitan exploración, no refutación.' },
                { e: 'Hacer la llamada en mal estado', c: 'Tu energía contamina toda la conversación.' },
                { e: 'Asumir qué quiere el prospecto', c: 'Terminás vendiendo la solución equivocada.' },
                { e: 'No usar el silencio', c: 'Llenás los espacios que el prospecto necesita para abrirse.' },
              ].map(e => (
                <div key={e.e} className="rounded-xl bg-[#1a0a0a] border border-[rgba(255,80,80,0.18)] p-4 flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-[#ff6b6b] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-text text-sm">{e.e}</p>
                    <p className="text-xs text-brand-muted mt-1">{e.c}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
  ],
};

// ─── MANUAL 02 ────────────────────────────────────────────────────────────────

const M02: Manual = {
  id: 'm02',
  number: '02',
  title: 'Estructura de Cualificación Comercial',
  subtitle: 'El sistema de diagnóstico que convierte conversaciones en cierres',
  description: 'Cuando cualificás bien, el prospecto se convence a sí mismo. Tu trabajo no es persuadir — es hacer las preguntas correctas en el orden correcto para que el prospecto recorra su propio razonamiento.',
  chapters: [
    {
      id: 'pilares',
      label: 'Los 2 Pilares',
      short: 'Pilares',
      icon: <Shield className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'pilar1',
          number: 'P1',
          title: 'Conexión genuina',
          subtitle: '6 comportamientos que crean apertura real',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">La conexión genuina no es "ser simpático". Es una serie de comportamientos técnicos que crean el ambiente donde el prospecto se siente seguro para revelar información real.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { n: 1, c: 'Presencia total', d: 'Estás 100% en la conversación.' },
                  { n: 2, c: 'Curiosidad genuina', d: 'Te interesa de verdad entender su situación.' },
                  { n: 3, c: 'No juzgar', d: 'Recibís lo que dice sin evaluarlo.' },
                  { n: 4, c: 'Reflejo activo', d: 'Repetís lo que dijeron para que sientan que fueron escuchados.' },
                  { n: 5, c: 'Validación emocional', d: 'Reconocés cómo se siente sin intentar cambiarlo.' },
                  { n: 6, c: 'Ritmo compartido', d: 'Tu velocidad y tono se adaptan al del prospecto.' },
                ].map(c => (
                  <div key={c.n} className="flex gap-3 items-start rounded-xl bg-[#0d0d14] border border-[rgba(26,111,255,0.10)] p-4">
                    <div className="w-7 h-7 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-gold">{c.n}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{c.c}</p>
                      <p className="text-xs text-brand-muted mt-0.5">{c.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo activar los 6 comportamientos de conexión de forma consciente en cualquier conversación.' },
            { type: 'error', text: 'Forzar la conexión. Si la curiosidad no es genuina, el prospecto lo siente — y es peor que no hacer nada.' },
          ],
        },
        {
          id: 'pilar2',
          number: 'P2',
          title: 'Recolección inteligente de información',
          subtitle: '4 preguntas previas · 9 dimensiones · 3 hábitos',
          body: (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-brand-gold mb-3 uppercase tracking-wider">Las 4 preguntas previas</p>
                <div className="space-y-2">
                  {['¿Cuánto tiempo lleva con este problema?','¿Qué intentó antes y por qué no funcionó?','¿Qué le pasaría si esto no cambia en 6 meses?','¿Qué significa para él resolver esto?'].map((p,i) => (
                    <div key={i} className="flex gap-3 text-sm rounded-xl bg-[#0d0d14] border border-[rgba(26,111,255,0.10)] px-4 py-3">
                      <span className="text-brand-gold font-bold shrink-0">{i+1}.</span>
                      <span className="text-brand-muted italic">"{p}"</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-brand-gold mb-3 uppercase tracking-wider">Las 9 dimensiones a mapear</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Situación actual','Problema principal','Síntomas','Causa raíz','Impacto emocional','Urgencia','Intentos previos','Visión del futuro','Decisor real'].map(d => (
                    <div key={d} className="rounded-xl bg-[#0d0d14] border border-[rgba(26,111,255,0.10)] px-3 py-2.5 text-center">
                      <p className="text-xs text-brand-muted">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-brand-gold mb-3 uppercase tracking-wider">Los 3 hábitos</p>
                <div className="space-y-2">
                  {[
                    { h: 'Escuchar sin interrumpir', d: 'Dejás que terminen. Siempre.' },
                    { h: 'Profundizar antes de avanzar', d: 'No pasás al siguiente punto si no entendiste el actual.' },
                    { h: 'Confirmar antes de interpretar', d: 'Repetís lo que escuchaste antes de asumir qué significa.' },
                  ].map(h => (
                    <div key={h.h} className="flex gap-3 items-start rounded-xl bg-[#0d0d14] border border-[rgba(26,111,255,0.10)] px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-brand-text">{h.h}</p>
                        <p className="text-xs text-brand-muted">{h.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Antes de hablar de cualquier solución, tengo información real sobre las 9 dimensiones del prospecto.' },
            { type: 'error', text: 'Saltarse la recolección porque "el prospecto parece claro". El que parece más claro suele tener las capas más profundas.' },
          ],
        },
      ],
    },
    {
      id: 'etapas',
      label: 'Etapas 01-04',
      short: 'E01-E04',
      icon: <Target className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'e01', number: 'E01', title: 'Identificar el interés', subtitle: 'El primer mapa de la conversación',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">El objetivo es entender <span className="text-brand-gold font-medium">qué trajo al prospecto aquí</span>. No lo que dicen en frío, sino lo que hay detrás: qué situación los llevó a buscar algo diferente.</p>
              <div className="rounded-2xl bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] p-5">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas clave:</p>
                {['¿Qué te llevó a buscar esto en este momento?','¿Hubo algo específico que pasó que te hizo tomar acción?','¿Qué estás buscando que hoy no tenés?'].map((p,i) => (
                  <div key={i} className="flex gap-2 text-sm mb-2"><span className="text-brand-gold">→</span><span className="text-brand-muted italic">"{p}"</span></div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Al final de esta etapa, puedo articular exactamente qué trajo al prospecto aquí y qué emoción hay detrás.' },
            { type: 'error', text: 'Quedarse con la respuesta superficial. Si dicen "quiero ganar más", la siguiente pregunta siempre es "¿por qué ahora?"' },
          ],
        },
        {
          id: 'e02', number: 'E02', title: 'Comprender la situación actual', subtitle: 'El contexto desde el que opera el prospecto',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Antes de hablar de cambio, necesitás entender <span className="text-brand-gold font-medium">desde dónde está partiendo</span>. Su situación actual es el punto de referencia para todo lo que viene.</p>
              <div className="rounded-2xl bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] p-5">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas clave:</p>
                {['¿En qué momento estás hoy en relación a [tema]?','¿Qué viene funcionando y qué no?','¿Cuánto tiempo llevás en esta situación?','¿Qué intentaste para cambiarlo?'].map((p,i) => (
                  <div key={i} className="flex gap-2 text-sm mb-2"><span className="text-brand-gold">→</span><span className="text-brand-muted italic">"{p}"</span></div>
                ))}
              </div>
              <p className="text-sm text-brand-muted bg-[#0d0d14] border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3"><span className="text-brand-text font-medium">Señal de etapa completa:</span> Podés describir la situación del prospecto mejor de lo que él la describiría.</p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Tengo un mapa claro de la situación actual del prospecto antes de explorar el problema.' },
            { type: 'error', text: 'Preguntar solo lo superficial. La duración de la situación y los intentos previos son datos críticos que la mayoría no pregunta.' },
          ],
        },
        {
          id: 'e03', number: 'E03', title: 'Detectar los síntomas', subtitle: 'Las manifestaciones visibles del problema',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Los síntomas son lo que el prospecto <em>ve</em> del problema. Identificarlos tiene dos objetivos: entender la magnitud y <span className="text-brand-gold font-medium">empezar a construir el costo del problema</span>.</p>
              <div className="rounded-2xl bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] p-5">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas clave:</p>
                {['¿Cómo se manifiesta esto en tu día a día?','¿Qué es lo que más te molesta de esta situación?','¿Hay algo que no podés hacer por esto?','¿Cómo afecta esto a las personas de tu entorno?'].map((p,i) => (
                  <div key={i} className="flex gap-2 text-sm mb-2"><span className="text-brand-gold">→</span><span className="text-brand-muted italic">"{p}"</span></div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo identificar al menos 3 síntomas concretos del problema del prospecto, en sus propias palabras.' },
            { type: 'error', text: 'Aceptar un síntoma vago sin profundizar. "Me cuesta vender" no es suficiente — ¿cuándo, cuánto, con qué tipo de cliente?' },
          ],
        },
        {
          id: 'e04', number: 'E04', title: 'Encontrar el problema real', subtitle: 'Debajo de los síntomas, la causa raíz',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Los síntomas son la superficie. El problema real es la <span className="text-brand-gold font-medium">causa raíz</span>. Tu trabajo es ayudarlos a llegar ahí a través de preguntas, no de afirmaciones.</p>
              <div className="rounded-2xl bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] p-5">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas clave:</p>
                {['¿Si tuvieras que identificar una sola causa de todo esto, cuál sería?','¿Qué creés que está en el origen de esta situación?','¿Cuándo empezó esto — hubo algo que lo desencadenó?'].map((p,i) => (
                  <div key={i} className="flex gap-2 text-sm mb-2"><span className="text-brand-gold">→</span><span className="text-brand-muted italic">"{p}"</span></div>
                ))}
              </div>
              <div className="rounded-xl bg-[#1a0f2e] border border-[rgba(150,100,255,0.20)] p-4">
                <p className="text-sm text-[#c0a0ff]"><span className="font-bold">Insight clave:</span> Cuando el prospecto nombra el problema real con sus propias palabras, ya está comprometido con resolverlo.</p>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'El prospecto puede articular su problema real con sus propias palabras — y yo puedo repetírselo exactamente como lo dijo.' },
            { type: 'error', text: 'Decirle al prospecto cuál es su problema real. Eso genera resistencia. Hacé las preguntas para que ELLOS lo descubran.' },
          ],
        },
      ],
    },
    {
      id: 'etapas2',
      label: 'Etapas 05-08',
      short: 'E05-E08',
      icon: <Target className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'e05', number: 'E05', title: 'Comprender el impacto emocional', subtitle: 'La dimensión que convierte información en motivación',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Los hechos informan. Las emociones mueven. Esta etapa conecta el problema real con <span className="text-brand-gold font-medium">cómo se siente el prospecto</span> al vivir esa situación. Las personas toman decisiones desde las emociones y las justifican con lógica.</p>
              <div className="rounded-2xl bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] p-5">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas clave:</p>
                {['¿Cómo te hace sentir estar en esta situación?','¿Qué es lo que más te pesa de todo esto?','¿Afecta esto cómo te ves a vos mismo / a tu familia?','¿Hay algo de esto de lo que no hablaste mucho con otros?'].map((p,i) => (
                  <div key={i} className="flex gap-2 text-sm mb-2"><span className="text-brand-gold">→</span><span className="text-brand-muted italic">"{p}"</span></div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo articular el impacto emocional del problema del prospecto con más precisión que él mismo.' },
            { type: 'error', text: 'Ignorar la emoción porque "es una conversación de negocios". Toda conversación de negocios es también una conversación humana.' },
          ],
        },
        {
          id: 'e06', number: 'E06', title: 'Acompañamiento y entendimiento', subtitle: 'El puente entre el diagnóstico y la solución',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Después de explorar el problema y el impacto, el prospecto necesita sentir que <span className="text-brand-gold font-medium">fue escuchado y entendido</span> antes de que puedas hablar de cualquier solución. Este es el paso que el 90% de los vendedores se saltean.</p>
              <div className="space-y-3">
                {[
                  { m: 'Resumen empático', d: 'Repetís todo lo que escuchaste — situación, síntomas, problema real, impacto — en sus propias palabras.' },
                  { m: 'Validación', d: 'Reconocés que lo que describieron es real y comprensible. No minimizás, no exagerás.' },
                  { m: 'Pregunta de confirmación', d: '"¿Sentís que capturé bien lo que me estás contando?" — Siempre.' },
                ].map(m => (
                  <div key={m.m} className="flex gap-3 items-start rounded-xl bg-[#0d0d14] border border-[rgba(26,111,255,0.10)] p-4">
                    <ArrowRight className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-brand-text">{m.m}</p>
                      <p className="text-xs text-brand-muted mt-0.5">{m.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Antes de hablar de la solución, siempre resumo lo que escuché y espero confirmación del prospecto.' },
            { type: 'error', text: 'Pasar directo de detectar el problema a presentar la solución. El prospecto no sintió que lo entendiste — y eso invalida todo lo que sigue.' },
          ],
        },
        {
          id: 'e07', number: 'E07', title: 'Justificar con lógica', subtitle: 'El componente racional que sostiene la decisión',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Las personas deciden emocionalmente y justifican con lógica. Esta etapa es donde le das al prospecto las <span className="text-brand-gold font-medium">herramientas lógicas</span> para justificar su decisión ante sí mismo y ante otros.</p>
              <div className="rounded-2xl bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] p-5">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas clave:</p>
                {['¿Qué te costaría seguir igual 6 meses más?','¿Si esto se resuelve, cómo cambia tu situación concretamente?','¿Tiene sentido para vos invertir en resolver esto ahora?'].map((p,i) => (
                  <div key={i} className="flex gap-2 text-sm mb-2"><span className="text-brand-gold">→</span><span className="text-brand-muted italic">"{p}"</span></div>
                ))}
              </div>
              <p className="text-sm text-brand-muted bg-[#0d0d14] border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3">Cuando el prospecto puede articular el costo de no actuar, el precio de la solución se vuelve relativo.</p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'El prospecto puede articular el costo de no actuar con más detalle del que yo podría describir.' },
            { type: 'error', text: 'Usar tu propia lógica para justificar la inversión. Tiene que ser LA LÓGICA DEL PROSPECTO — que venga de ellos.' },
          ],
        },
        {
          id: 'e08', number: 'E08', title: 'Aportar valor', subtitle: 'La presentación calibrada — no genérica',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-brand-muted">Recién en esta etapa hablás de tu solución. No es un pitch genérico — es una presentación <span className="text-brand-gold font-medium">construida con las palabras del prospecto</span>.</p>
              <div className="space-y-3">
                {[
                  { t: '1. Reconectar con el problema', d: '"Dijiste que lo que más te pesa es X. Esto está diseñado exactamente para eso."' },
                  { t: '2. Presentar en términos de resultados', d: 'No funcionalidades — qué cambia en su vida.' },
                  { t: '3. Conectar cada punto con algo que dijeron', d: 'Cada beneficio tiene un ancla en algo que el prospecto expresó.' },
                  { t: '4. Pausar y preguntar', d: '"¿Cómo ves esto en relación a lo que me contaste?"' },
                ].map(s => (
                  <div key={s.t} className="border-l-2 border-brand-gold/40 pl-4 py-1">
                    <p className="text-sm font-semibold text-brand-text">{s.t}</p>
                    <p className="text-xs text-brand-muted mt-0.5 italic">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Mi presentación está hecha 100% con las palabras y situación del prospecto — nadie recibe el mismo pitch.' },
            { type: 'error', text: 'Hacer el pitch genérico que hacés con todos. El prospecto siente que no los escuchaste.' },
          ],
        },
      ],
    },
    {
      id: 'cierre02',
      label: 'Cierre',
      short: 'Cierre',
      icon: <Award className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'reglas02', title: 'Las 7 reglas transversales de la cualificación',
          body: (
            <div className="space-y-3">
              {[
                { n: 1, r: 'Las etapas no son opcionales', d: 'Podés acelerarlas, pero no saltearlas. Cada etapa construye la siguiente.' },
                { n: 2, r: 'El orden importa', d: 'Síntomas antes que causa raíz. Emoción antes de lógica. Lógica antes de solución.' },
                { n: 3, r: 'Nunca presentes sin haber entendido', d: 'Si no pasaste por E01-E06, tu presentación es una apuesta, no una solución.' },
                { n: 4, r: 'Sus palabras, no las tuyas', d: 'Todo lo que articulés sobre el problema tiene que venir de lo que ellos dijeron.' },
                { n: 5, r: 'La curiosidad es técnica', d: 'No es una habilidad innata — es un conjunto de comportamientos que se practican.' },
                { n: 6, r: 'El cierre es una confirmación, no un evento', d: 'Si el sistema funcionó, el cierre es la consecuencia lógica de todo lo anterior.' },
                { n: 7, r: 'Lo que no se mide no se mejora', d: 'Después de cada llamada, revisá qué etapa estuvo débil. Ahí está tu próxima mejora.' },
              ].map(r => (
                <div key={r.n} className="flex gap-4 items-start rounded-2xl bg-[#0d0d14] border border-[rgba(26,111,255,0.10)] p-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-brand-gold">{r.n}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-text">{r.r}</p>
                    <p className="text-sm text-brand-muted mt-1">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'tablero02', title: 'Tablero de verificación por etapa',
          body: (
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { e: 'E01', c: 'Sé qué trajo al prospecto aquí y qué emoción hay detrás' },
                { e: 'E02', c: 'Tengo mapa de situación actual (duración, intentos previos)' },
                { e: 'E03', c: 'Identifiqué al menos 3 síntomas concretos' },
                { e: 'E04', c: 'El prospecto articuló el problema real con sus propias palabras' },
                { e: 'E05', c: 'Entiendo el impacto emocional de vivir esa situación' },
                { e: 'E06', c: 'Resumí lo que escuché y el prospecto confirmó' },
                { e: 'E07', c: 'El prospecto articuló el costo de no actuar' },
                { e: 'E08', c: 'Mi presentación está construida con sus palabras' },
                { e: 'P1', c: 'Mantuve los 6 comportamientos de conexión genuina' },
                { e: 'P2', c: 'Tengo información de las 9 dimensiones antes de presentar' },
              ].map(c => (
                <div key={c.e} className="flex items-start gap-3 rounded-xl bg-[#0d0d0d] border border-[rgba(255,255,255,0.05)] px-4 py-3">
                  <div className="rounded-lg bg-brand-gold/10 border border-brand-gold/20 px-2 py-1 shrink-0">
                    <span className="text-[10px] font-black text-brand-gold">{c.e}</span>
                  </div>
                  <p className="text-sm text-brand-muted">{c.c}</p>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'errores02', title: 'Errores que invalidan el diagnóstico',
          body: (
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { e: 'Saltar etapas', c: 'Cada etapa que saltás es un agujero en tu diagnóstico.' },
                { e: 'Presentar antes de la E06', c: 'Si presentás sin acompañamiento, el prospecto no se sintió escuchado.' },
                { e: 'Usar tus palabras, no las suyas', c: 'La conversación deja de ser sobre ellos y empieza a ser sobre vos.' },
                { e: 'No profundizar el impacto emocional', c: 'Sin emoción, la decisión no tiene urgencia real.' },
                { e: 'El mismo pitch para todos', c: 'Si tu presentación no menciona nada de lo que dijeron, no diagnosticaste.' },
                { e: 'Cerrar sin confirmar la lógica (E07)', c: 'El prospecto tiene la emoción pero no la justificación → "lo pienso" → se cae.' },
              ].map(e => (
                <div key={e.e} className="rounded-xl bg-[#1a0a0a] border border-[rgba(255,80,80,0.18)] p-4 flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-[#ff6b6b] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-brand-text text-sm">{e.e}</p>
                    <p className="text-xs text-brand-muted mt-1">{e.c}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
  ],
};

const MANUALS = [M01, M02];

// ─── CALLOUT ─────────────────────────────────────────────────────────────────

function Callout({ c }: { c: Callout }) {
  const isDom = c.type === 'dominio';
  return (
    <div className={cn('rounded-2xl border p-4 flex gap-3', isDom ? 'bg-[#0f1a2e] border-[rgba(26,111,255,0.25)]' : 'bg-[#1a0a0a] border-[rgba(255,80,80,0.25)]')}>
      {isDom
        ? <Target className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
        : <AlertTriangle className="h-4 w-4 text-[#ff6b6b] shrink-0 mt-0.5" />}
      <div>
        <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', isDom ? 'text-brand-gold' : 'text-[#ff6b6b]')}>
          {isDom ? 'Criterio de dominio' : 'Error frecuente'}
        </p>
        <p className="text-sm text-brand-muted leading-relaxed">{c.text}</p>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function ManualViewer() {
  const [manualIdx, setManualIdx] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [sectionIdx, setSectionIdx] = useState(0);

  const manual = MANUALS[manualIdx];
  const chapter = manual.chapters[chapterIdx];
  const section = chapter.sections[sectionIdx];

  function goTo(mi: number, ci: number, si: number) {
    setManualIdx(mi); setChapterIdx(ci); setSectionIdx(si);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // flat list para prev/next
  const flat: [number,number,number][] = [];
  MANUALS.forEach((m,mi) => m.chapters.forEach((c,ci) => c.sections.forEach((_,si) => flat.push([mi,ci,si]))));
  const flatIdx = flat.findIndex(([mi,ci,si]) => mi===manualIdx && ci===chapterIdx && si===sectionIdx);
  const prev = flat[flatIdx-1];
  const next = flat[flatIdx+1];

  return (
    <div className="space-y-0">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-2xl border border-[rgba(26,111,255,0.20)] bg-gradient-to-br from-[#0a1428] via-[#050d1e] to-[#050505] p-6 md:p-10 mb-6">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-gold/8 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none" />

        {/* Manual tabs */}
        <div className="relative flex gap-2 mb-8">
          {MANUALS.map((m, i) => (
            <button key={m.id} onClick={() => goTo(i,0,0)}
              className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all border',
                manualIdx === i
                  ? 'bg-brand-gold text-white border-brand-gold shadow-[0_0_20px_rgba(26,111,255,0.4)]'
                  : 'bg-[rgba(26,111,255,0.06)] text-brand-muted border-[rgba(26,111,255,0.12)] hover:text-brand-text hover:border-[rgba(26,111,255,0.30)]'
              )}>
              <BookOpen className="h-3.5 w-3.5" />
              Manual {m.number}
            </button>
          ))}
        </div>

        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold mb-2">
            Areté Fuera de Serie · Manual {manual.number}
          </p>
          <h1 className="text-2xl md:text-4xl font-black text-brand-text leading-tight mb-3">
            {manual.title}
          </h1>
          <p className="text-brand-muted max-w-2xl leading-relaxed">{manual.description}</p>
        </div>
      </section>

      {/* ── CHAPTER TABS ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {manual.chapters.map((ch, ci) => (
          <button key={ch.id} onClick={() => goTo(manualIdx, ci, 0)}
            className={cn('flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border shrink-0',
              chapterIdx === ci
                ? 'bg-[rgba(26,111,255,0.15)] text-brand-gold border-[rgba(26,111,255,0.40)] shadow-[0_0_12px_rgba(26,111,255,0.15)]'
                : 'bg-[#0d0d0d] text-brand-muted border-[rgba(255,255,255,0.05)] hover:text-brand-text hover:border-[rgba(26,111,255,0.20)]'
            )}>
            {ch.icon}
            {ch.short}
          </button>
        ))}
      </div>

      {/* ── SECTION PILLS (dentro del chapter) ── */}
      {chapter.sections.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {chapter.sections.map((s, si) => (
            <button key={s.id} onClick={() => goTo(manualIdx, chapterIdx, si)}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border',
                sectionIdx === si
                  ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/30'
                  : 'bg-[#0d0d0d] text-brand-muted border-[rgba(255,255,255,0.04)] hover:text-brand-text'
              )}>
              {s.number ? `${s.number} · ${s.title}` : s.title}
            </button>
          ))}
        </div>
      )}

      {/* ── CONTENT CARD ── */}
      <div className="card-premium rounded-2xl p-6 md:p-8 space-y-6">

        {/* Section header */}
        <div className="flex items-start gap-4 pb-6 border-b border-[rgba(26,111,255,0.10)]">
          {section.number && (
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 shrink-0">
              <span className="text-xl font-black text-brand-gold">{section.number}</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-brand-text">{section.title}</h2>
            {section.subtitle && <p className="text-brand-muted mt-1">{section.subtitle}</p>}
          </div>
        </div>

        {/* Body */}
        <div>{section.body}</div>

        {/* Callouts */}
        {section.callouts && section.callouts.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {section.callouts.map((c,i) => <Callout key={i} c={c} />)}
          </div>
        )}
      </div>

      {/* ── PREV / NEXT ── */}
      <div className="flex items-center justify-between pt-6">
        {prev ? (
          <button onClick={() => goTo(...prev)}
            className="btn-ghost-gold flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
        ) : <div />}

        <p className="text-xs text-brand-muted">{flatIdx + 1} / {flat.length}</p>

        {next ? (
          <button onClick={() => goTo(...next)}
            className="btn-gold flex items-center gap-2">
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-brand-gold font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Completado
          </div>
        )}
      </div>
    </div>
  );
}
