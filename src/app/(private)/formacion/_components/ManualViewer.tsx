'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronRight, ChevronLeft, CheckCircle2, Circle, BookOpen,
  Lightbulb, AlertTriangle, Target, Award, ArrowRight, Menu, X,
  Zap, Brain, MessageSquare, Eye, Shield, TrendingUp,
} from 'lucide-react';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Callout = { type: 'dominio' | 'error' | 'tip' | 'regla'; text: string };
type Block = {
  id: string;
  number?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  body: React.ReactNode;
  callouts?: Callout[];
};
type Chapter = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  blocks: Block[];
};
type Manual = {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  chapters: Chapter[];
};

// ─── CONTENIDO — MANUAL 01 ────────────────────────────────────────────────────

const MANUAL_01: Manual = {
  id: 'm01',
  number: '01',
  title: 'Fundamentos de la Conversación Comercial',
  subtitle: 'La base técnica de toda comunicación efectiva',
  icon: <Brain className="h-5 w-5" />,
  chapters: [
    {
      id: 'principio',
      label: 'Principio Fundamental',
      icon: <Zap className="h-4 w-4" />,
      blocks: [
        {
          id: 'principio-1',
          title: 'El principio que lo cambia todo',
          body: (
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-[#e8e8e8]">
                Una llamada comercial <strong className="text-brand-gold">no es un evento</strong>. Es el resultado de un proceso. Lo que pasa antes, durante y después de la conversación determina si cerrás o no.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                La mayoría de los vendedores creen que la habilidad de vender está en lo que dicen. En realidad, está en cómo escuchan, cómo crean contexto y cómo se posicionan mentalmente antes de abrir la boca.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                Este manual te entrena en los fundamentos invisibles que separan a un vendedor promedio de uno que cierra en frío, con extraños, en 30 minutos.
              </p>
            </div>
          ),
        },
      ],
    },
    {
      id: 'bloque01',
      label: 'Bloque 01 — Qué es realmente una llamada',
      icon: <MessageSquare className="h-4 w-4" />,
      blocks: [
        {
          id: 'b01-c01',
          number: '01',
          title: 'La conversación',
          subtitle: 'No es un monólogo con público',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Una conversación comercial es un intercambio de información con un objetivo. No es un discurso. No es una presentación. Es un proceso de dos vías donde el vendedor <strong className="text-brand-gold">dirige</strong> sin imponer.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                El error más común: llegar a hablar <em>sobre</em> el producto en lugar de hablar <em>con</em> la persona. El que más habla, más cierra — es un mito. El que más escucha con intención, cierra.
              </p>
              <ul className="space-y-2 mt-4">
                {['Toda conversación tiene un emisor y un receptor activos', 'El operador (vos) guía sin dominar', 'El objetivo no es convencer, es hacer descubrir', 'Una conversación sin intercambio real no es venta, es discurso'].map(p => (
                  <li key={p} className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-brand-gold mt-0.5 shrink-0" />
                    <span className="text-[#c0c0c0] text-sm">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo distinguir entre una conversación de intercambio real y un monólogo disfrazado de llamada.' },
            { type: 'error', text: 'Hablar más del 60% del tiempo en la primera mitad de la llamada. Si eso pasa, no hay conversación — hay presentación.' },
          ],
        },
        {
          id: 'b01-c02',
          number: '02',
          title: 'El punto en común',
          subtitle: 'El terreno donde todo se construye',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Antes de ir a cualquier solución, necesitás establecer un <strong className="text-brand-gold">punto en común</strong>: algo que vos y el prospecto ven igual. Sin eso, hablás en idiomas distintos.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                El punto en común no es "me caés bien". Es un acuerdo sobre la realidad del prospecto: su situación, su dolor, su deseo. Cuando ese acuerdo existe, la conversación fluye porque ambos están parados en el mismo piso.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4 mt-2">
                <p className="text-sm text-brand-gold font-semibold mb-2">Cómo se construye:</p>
                <ol className="space-y-2">
                  {['Escuchás activamente (sin pensar en qué vas a decir)', 'Reflejás lo que dijeron con sus propias palabras', 'Confirmás que lo entendiste bien antes de avanzar', 'Recién ahí avanzás al siguiente punto'].map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-[#c0c0c0]">
                      <span className="text-brand-gold font-bold shrink-0">{i + 1}.</span>
                      {s}
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
          id: 'b01-c03',
          number: '03',
          title: 'El interés',
          subtitle: 'Sin interés no hay conversación posible',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                El interés es lo que mueve a alguien a seguir en la conversación. Hay dos tipos: el <strong className="text-brand-gold">interés declarado</strong> (lo que dicen que quieren) y el <strong className="text-brand-gold">interés real</strong> (lo que en verdad los mueve).
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                El vendedor amateur trabaja el interés declarado. El vendedor élite descubre el interés real y trabaja desde ahí. Esto es lo que hace que la conversación se sienta diferente — el prospecto siente que lo <em>entienden</em>.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: 'Interés declarado', text: '"Quiero ganar más dinero"', color: 'rgba(26,111,255,0.15)' },
                  { label: 'Interés real', text: '"Quiero dejar de sentirme en el límite cada mes"', color: 'rgba(26,111,255,0.25)' },
                ].map(c => (
                  <div key={c.label} className="rounded-lg p-3 border border-[rgba(26,111,255,0.20)]" style={{ background: c.color }}>
                    <p className="text-xs font-semibold text-brand-gold mb-1">{c.label}</p>
                    <p className="text-sm text-[#c0c0c0] italic">{c.text}</p>
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
      label: 'Bloque 02 — Cómo viaja la información',
      icon: <Zap className="h-4 w-4" />,
      blocks: [
        {
          id: 'b02-c04',
          number: '04',
          title: 'Emisor / receptor / canal',
          subtitle: 'El modelo básico que todos ignoran',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Todo mensaje tiene tres elementos: quien lo envía (emisor), quien lo recibe (receptor), y el medio por donde viaja (canal). El canal en una llamada comercial es la voz + las palabras. Y cada uno de esos elementos puede <strong className="text-brand-gold">distorsionar el mensaje</strong>.
              </p>
              <div className="flex items-center justify-center gap-3 my-6">
                {['Emisor', '→', 'Canal', '→', 'Receptor'].map((e, i) => (
                  <div key={i} className={cn('text-center', e === '→' ? 'text-brand-gold text-xl' : '')}>
                    {e !== '→' ? (
                      <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.25)] rounded-lg px-4 py-2">
                        <p className="text-sm font-semibold text-brand-gold">{e}</p>
                      </div>
                    ) : <span>{e}</span>}
                  </div>
                ))}
              </div>
              <p className="leading-relaxed text-[#c0c0c0]">
                En ventas, el canal es imperfecto siempre. Lo que vos emitís no es exactamente lo que el otro recibe. Por eso la claridad, el ritmo y la confirmación son herramientas técnicas, no estilos de comunicación.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Soy consciente de que lo que digo y lo que el prospecto escucha son dos cosas distintas. Tengo hábitos para reducir esa brecha.' },
            { type: 'error', text: 'Asumir que porque dijiste algo, el otro lo entendió como vos quisiste.' },
          ],
        },
        {
          id: 'b02-c05',
          number: '05',
          title: 'La sintonía',
          subtitle: 'El estado que hace posible la influencia',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                La sintonía es el estado en que el prospecto <strong className="text-brand-gold">baja la guardia</strong> y empieza a fluir naturalmente en la conversación. No es que sea tu amigo — es que se siente escuchado, no juzgado, y en un ambiente seguro.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                Sin sintonía, cada palabra que decís es procesada con filtro de desconfianza. Con sintonía, la información que compartís llega con mucho menos resistencia.
              </p>
              <div className="space-y-3 mt-4">
                {[
                  { title: 'Vocal', desc: 'Ajustás tu tono y ritmo al del prospecto' },
                  { title: 'Emocional', desc: 'Reconocés su estado y no lo contradecís' },
                  { title: 'Conceptual', desc: 'Hablás desde su realidad, no desde la tuya' },
                ].map(s => (
                  <div key={s.title} className="flex gap-3 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#e8e8e8]">{s.title}</p>
                      <p className="text-sm text-[#c0c0c0]">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo identificar si hay o no sintonía en los primeros 3 minutos de una llamada y sé qué hacer para crearla.' },
            { type: 'error', text: 'Intentar presentar o persuadir antes de crear sintonía. Es como querer bailar con alguien que todavía no te vio.' },
          ],
        },
        {
          id: 'b02-c06',
          number: '06',
          title: 'Emisión involuntaria',
          subtitle: 'Lo que transmitís sin querer',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Emitís mensajes constantemente que no planeaste emitir. Tu tono cuando estás cansado. Tu velocidad cuando estás nervioso. La pausa antes de responder una objeción. Esos son mensajes que el prospecto recibe y procesa.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                La <strong className="text-brand-gold">emisión involuntaria</strong> puede arruinar una conversación perfectamente construida. Un vendedor técnicamente hábil que está ansioso va a perder contra un vendedor menos hábil pero que llega centrado.
              </p>
              <div className="bg-[#1a0f0f] border border-[rgba(255,60,60,0.20)] rounded-lg p-4 mt-2">
                <p className="text-sm font-semibold text-[#ff6b6b] mb-2">Señales de emisión involuntaria negativa:</p>
                <ul className="space-y-1">
                  {['Hablar demasiado rápido (ansiedad)', 'Subir el tono al presentar precio (inseguridad)', 'Usar "¿no?" al final de frases (necesidad de validación)', 'Silencio incómodo después de objeciones (miedo)'].map(s => (
                    <li key={s} className="text-sm text-[#c0c0c0] flex gap-2"><span className="text-[#ff6b6b]">×</span>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo llegar a una llamada en un estado controlado y mantenerlo durante toda la conversación, independientemente de lo que pase.' },
            { type: 'error', text: 'Creer que el prospecto solo escucha tus palabras. Escucha todo — tu tono, tu ritmo, tu energía.' },
          ],
        },
      ],
    },
    {
      id: 'bloque03',
      label: 'Bloque 03 — Por qué nadie ve lo mismo',
      icon: <Eye className="h-4 w-4" />,
      blocks: [
        {
          id: 'b03-c07',
          number: '07',
          title: 'Información y percepción',
          subtitle: 'La realidad que cada uno construye',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Cada persona interpreta la información a través de su historia, sus creencias y sus experiencias. No hay dos prospectos que procesen lo mismo de la misma forma. Lo que para vos es "obvio", para el otro puede ser irrelevante o amenazante.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                Esto tiene una implicación directa para las ventas: no existe un mensaje que funcione para todos. El trabajo del operador es <strong className="text-brand-gold">diagnosticar cómo percibe el prospecto</strong> antes de construir cualquier argumento.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Adapto mi forma de presentar la información según cómo percibe las cosas el prospecto, no según cómo yo las veo.' },
            { type: 'error', text: 'Hablar desde tu propia percepción. "Esto es un precio excelente" no significa nada si el prospecto tiene otra referencia.' },
          ],
        },
        {
          id: 'b03-c08',
          number: '08',
          title: 'Los filtros',
          subtitle: 'Qué procesa el prospecto y qué descarta',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                El cerebro filtra constantemente. No procesa todo lo que recibe — selecciona lo que confirma sus creencias y descarta lo que las contradice. Esto se llama <strong className="text-brand-gold">sesgo de confirmación</strong> y es tu mayor adversario en ventas.
              </p>
              <div className="grid gap-3 mt-4">
                {[
                  { name: 'Filtro de creencia', desc: 'Si cree que "esto no es para mí", va a buscar razones para confirmar eso' },
                  { name: 'Filtro de experiencia', desc: 'Si tuvo una mala experiencia previa, va a interpretar todo con desconfianza' },
                  { name: 'Filtro de urgencia', desc: 'Si no siente que su problema es urgente, no va a percibir la solución como valiosa' },
                ].map(f => (
                  <div key={f.name} className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.15)] rounded-lg p-3">
                    <p className="text-sm font-semibold text-brand-gold">{f.name}</p>
                    <p className="text-sm text-[#c0c0c0] mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
              <p className="leading-relaxed text-[#c0c0c0] mt-2">
                Tu trabajo no es vencer los filtros — es entenderlos y hablar desde adentro de ellos.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Identifico los filtros principales del prospecto en los primeros minutos y los uso como mapa para construir la conversación.' },
            { type: 'error', text: 'Intentar convencer a alguien de lo contrario de lo que ya cree. No funciona — se cierra más.' },
          ],
        },
        {
          id: 'b03-c09',
          number: '09',
          title: 'Preguntar vs asumir',
          subtitle: 'El hábito que más dinero cuesta',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                La mayoría de los errores de venta vienen de asumir. Asumir qué quiere el prospecto. Asumir qué lo frena. Asumir cuánto puede pagar. Cada asunción es un riesgo innecesario cuando la alternativa — preguntar — es gratis.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-[#1a0f0f] border border-[rgba(255,60,60,0.20)] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#ff6b6b] mb-2">Asumir</p>
                  <p className="text-sm text-[#c0c0c0]">"Seguro le interesa la opción económica"<br />"Parece que el problema es el precio"<br />"Ya debe saber cómo funciona esto"</p>
                </div>
                <div className="bg-[#0f1a0f] border border-[rgba(26,255,100,0.20)] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#6bff8a] mb-2">Preguntar</p>
                  <p className="text-sm text-[#c0c0c0]">"¿Qué es lo más importante para vos en esto?"<br />"¿Qué te genera más hesitación?"<br />"¿Tuviste experiencias previas en esto?"</p>
                </div>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'En toda mi conversación, no asumo nada que pueda preguntar. Cada acción que tomo está basada en información real del prospecto.' },
            { type: 'error', text: 'La pregunta que más se evita: "¿Por qué?" Preguntar el porqué de una hesitación da más información que cualquier argumento de cierre.' },
          ],
        },
      ],
    },
    {
      id: 'bloque04',
      label: 'Bloque 04 — El operador',
      icon: <Shield className="h-4 w-4" />,
      blocks: [
        {
          id: 'b04-c10',
          number: '10',
          title: 'Los primeros segundos',
          subtitle: 'La ventana que no se repite',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Los primeros 7 segundos de cualquier conversación generan una impresión que el cerebro del prospecto tarda entre 10 y 20 minutos en modificar — si es que lo hace. Esa ventana determina si la persona está abierta o cerrada antes de que hayas dicho algo de valor.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                No se trata de un script de apertura. Se trata de <strong className="text-brand-gold">cómo llegás a esos primeros segundos</strong>: tu energía, tu estado, tu presencia. Todo eso se transmite antes de la primera palabra técnica.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4 mt-2">
                <p className="text-sm font-semibold text-brand-gold mb-3">Los 3 elementos de apertura:</p>
                {[
                  { n: '1', t: 'Presencia', d: 'Llegás mentalmente presente, no pensando en la llamada anterior' },
                  { n: '2', t: 'Tono', d: 'Voz firme, calmada, con energía — sin ansiedad ni apuro' },
                  { n: '3', t: 'Marco', d: 'Establecés desde el inicio que esta es una conversación de diagnóstico, no de ventas' },
                ].map(e => (
                  <div key={e.n} className="flex gap-3 mb-2 last:mb-0">
                    <div className="w-6 h-6 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-gold">{e.n}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#e8e8e8]">{e.t}</p>
                      <p className="text-xs text-[#a0a0a0]">{e.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Tengo un ritual pre-llamada que me garantiza llegar en estado óptimo a los primeros segundos.' },
            { type: 'error', text: 'Entrar a la llamada directo desde otra actividad, sin transición. El prospecto hereda tu estado anterior.' },
          ],
        },
        {
          id: 'b04-c11',
          number: '11',
          title: 'Control del estado',
          subtitle: 'El activo más subestimado del vendedor',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                El estado emocional del operador es el activo más importante y el más ignorado. Podés tener el mejor script del mundo, pero si estás ansioso, frustrado o en modo "necesito cerrar", el prospecto lo va a sentir — y va a reaccionar cerrándose.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                El control del estado no significa no sentir nada. Significa que tus emociones <strong className="text-brand-gold">no conducen la conversación</strong>. Vos la conducís. Las emociones son información, no el volante.
              </p>
              <div className="space-y-2 mt-4">
                {[
                  { estado: 'Ansiedad por cerrar', resultado: 'El prospecto siente presión → se cierra' },
                  { estado: 'Miedo al "no"', resultado: 'Evitás las preguntas duras → perdés información' },
                  { estado: 'Aburrimiento', resultado: 'Tu energía baja → la llamada pierde vida' },
                  { estado: 'Estado neutro-curioso', resultado: 'Creás espacio → el prospecto se abre' },
                ].map(r => (
                  <div key={r.estado} className={cn('flex items-start gap-3 rounded-lg p-3 text-sm', r.estado === 'Estado neutro-curioso' ? 'bg-[#0f1a2e] border border-[rgba(26,111,255,0.25)]' : 'bg-[#141414] border border-[rgba(255,255,255,0.05)]')}>
                    <div className="flex-1">
                      <span className={cn('font-medium', r.estado === 'Estado neutro-curioso' ? 'text-brand-gold' : 'text-[#e0e0e0]')}>{r.estado}</span>
                      <span className="text-[#888] mx-2">→</span>
                      <span className="text-[#c0c0c0]">{r.resultado}</span>
                    </div>
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
          id: 'b04-c12',
          number: '12',
          title: 'El marco del solucionador',
          subtitle: 'La postura que genera autoridad real',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                El marco es la perspectiva desde la cual conducís la conversación. El vendedor promedio opera desde el marco del vendedor: "necesito que compres". El operador élite opera desde el marco del solucionador: <strong className="text-brand-gold">"estoy aquí para diagnosticar si puedo ayudarte"</strong>.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                Ese cambio de perspectiva lo cambia todo. Cuando operás desde el marco del solucionador, tus preguntas suenan a diagnóstico, no a interrogatorio. Tu silencio se siente como reflexión, no como ansiedad. Y tu "no" se siente como integridad, no como rechazo.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { marco: 'Vendedor', color: 'rgba(255,60,60,0.12)', border: 'rgba(255,60,60,0.25)', items: ['Necesito que compres', 'Evito las objeciones', 'El cierre es el objetivo', 'Mi éxito = que digan sí'] },
                  { marco: 'Solucionador', color: 'rgba(26,111,255,0.12)', border: 'rgba(26,111,255,0.30)', items: ['Necesito entender si puedo ayudarte', 'Las objeciones son información', 'El diagnóstico es el objetivo', 'Mi éxito = decisión correcta del prospecto'] },
                ].map(m => (
                  <div key={m.marco} className="rounded-lg p-3 border" style={{ background: m.color, borderColor: m.border }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: m.marco === 'Vendedor' ? '#ff6b6b' : '#1a6fff' }}>Marco del {m.marco}</p>
                    <ul className="space-y-1">
                      {m.items.map(i => <li key={i} className="text-xs text-[#c0c0c0]">• {i}</li>)}
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
      id: 'cierre01',
      label: 'Cierre — Reglas y Tablero',
      icon: <Award className="h-4 w-4" />,
      blocks: [
        {
          id: 'reglas-01',
          title: 'Reglas transversales',
          subtitle: 'Las 7 reglas que aplican en toda conversación',
          body: (
            <div className="space-y-3">
              {[
                { n: 1, regla: 'Escuchá para entender, no para responder', desc: 'Mientras pensás en qué vas a decir, dejás de escuchar lo que el prospecto te está revelando.' },
                { n: 2, regla: 'No asumas, preguntá', desc: 'Cada asunción es un riesgo. Cada pregunta es información.' },
                { n: 3, regla: 'El silencio es una herramienta', desc: 'Después de una pregunta poderosa, callate. El prospecto llena el silencio — y lo que pone ahí es oro.' },
                { n: 4, regla: 'Primero entiende, después habla de soluciones', desc: 'No presentés nada hasta haber mapeado completamente el problema.' },
                { n: 5, regla: 'El estado del operador es responsabilidad del operador', desc: 'No es culpa del prospecto si la llamada salió mal porque llegaste en mal estado.' },
                { n: 6, regla: 'Una objeción es una pregunta disfrazada', desc: 'Nadie dice "es caro" porque quiere terminar la conversación. Quieren que les des una razón para seguir.' },
                { n: 7, regla: 'El cierre es consecuencia del diagnóstico', desc: 'Si el diagnóstico fue real, el cierre es casi automático. Si el cierre se siente difícil, el problema estuvo antes.' },
              ].map(r => (
                <div key={r.n} className="flex gap-4 items-start bg-[#0f1420] border border-[rgba(26,111,255,0.15)] rounded-lg p-4">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-brand-gold">{r.n}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#e8e8e8] mb-1">{r.regla}</p>
                    <p className="text-sm text-[#a0a0a0]">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'tablero-01',
          title: 'Tablero de dominio',
          subtitle: '12 criterios — ¿Dónde estás?',
          body: (
            <div className="space-y-3">
              <p className="text-[#c0c0c0] text-sm mb-4">Marcá mentalmente cada concepto: ¿lo entiendo? ¿lo aplico? ¿lo domino?</p>
              <div className="grid grid-cols-1 gap-2">
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
                  <div key={i} className="flex items-center gap-3 bg-[#0d0d0d] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-3">
                    <div className="w-6 h-6 rounded-full border border-[rgba(26,111,255,0.30)] bg-[rgba(26,111,255,0.08)] flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-brand-gold">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <p className="text-sm text-[#c0c0c0]">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          id: 'errores-01',
          title: 'Errores que rompen la conversación',
          body: (
            <div className="space-y-3">
              {[
                { error: 'Hablar más del 60% del tiempo', consecuencia: 'El prospecto no siente que lo escuchaste — y tenés razón, no lo escuchaste.' },
                { error: 'Saltar al precio sin diagnóstico', consecuencia: 'El prospecto no tiene contexto para evaluar si el precio tiene sentido.' },
                { error: 'Responder objeciones con argumentos', consecuencia: 'Las objeciones necesitan exploración, no refutación.' },
                { error: 'Hacer la llamada en mal estado', consecuencia: 'Tu energía contamina toda la conversación.' },
                { error: 'Asumir qué quiere el prospecto', consecuencia: 'Terminás vendiendo la solución equivocada para el problema equivocado.' },
                { error: 'No usar el silencio', consecuencia: 'Llenás con palabras los espacios que el prospecto necesita para abrirse.' },
              ].map(e => (
                <div key={e.error} className="bg-[#1a0a0a] border border-[rgba(255,60,60,0.20)] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-[#ff6b6b] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-[#e8e8e8] text-sm">{e.error}</p>
                      <p className="text-xs text-[#a0a0a0] mt-1">{e.consecuencia}</p>
                    </div>
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

// ─── CONTENIDO — MANUAL 02 ────────────────────────────────────────────────────

const MANUAL_02: Manual = {
  id: 'm02',
  number: '02',
  title: 'Estructura de Cualificación Comercial',
  subtitle: 'El sistema de diagnóstico que convierte conversaciones en cierres',
  icon: <Target className="h-5 w-5" />,
  chapters: [
    {
      id: 'principio02',
      label: 'Principio Fundamental',
      icon: <Zap className="h-4 w-4" />,
      blocks: [
        {
          id: 'principio02-1',
          title: 'La cualificación no es un filtro. Es el cierre.',
          body: (
            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-[#e8e8e8]">
                La mayoría cree que cualificar es decidir si el prospecto "puede comprar". En Areté, cualificar es <strong className="text-brand-gold">el proceso de venta en sí mismo</strong>.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                Cuando cualificás bien, el prospecto se convence a sí mismo. Tu trabajo no es persuadir — es hacer las preguntas correctas en el orden correcto para que el prospecto recorra su propio razonamiento y llegue a su propia conclusión.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                Este manual es un sistema de 8 etapas + 2 pilares. No es un script. Es una arquitectura de conversación que podés ejecutar con cualquier prospecto, en cualquier nicho, con cualquier producto.
              </p>
            </div>
          ),
        },
      ],
    },
    {
      id: 'pilares',
      label: 'Los 2 Pilares',
      icon: <Shield className="h-4 w-4" />,
      blocks: [
        {
          id: 'pilar1',
          title: 'Pilar 1 — Conexión genuina',
          subtitle: '6 comportamientos que crean apertura real',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                La conexión genuina no es "ser simpático". Es una serie de comportamientos técnicos que crean el ambiente donde el prospecto se siente seguro para revelar información real.
              </p>
              <div className="space-y-3 mt-2">
                {[
                  { n: 1, comp: 'Presencia total', desc: 'Estás 100% en la conversación. Sin distracciones, sin multitasking mental.' },
                  { n: 2, comp: 'Curiosidad genuina', desc: 'Te interesa de verdad entender su situación, no solo procesar su respuesta.' },
                  { n: 3, comp: 'No juzgar', desc: 'Recibís lo que dice sin evaluarlo. El juicio cierra, la neutralidad abre.' },
                  { n: 4, comp: 'Reflejo activo', desc: 'Repetís o parafraseás lo que dijeron para que sientan que fueron escuchados.' },
                  { n: 5, comp: 'Validación emocional', desc: 'Reconocés cómo se siente sin intentar cambiar eso.' },
                  { n: 6, comp: 'Ritmo compartido', desc: 'Tu velocidad y tono se adaptan al del prospecto, no al revés.' },
                ].map(c => (
                  <div key={c.n} className="flex gap-4 items-start bg-[#0f1420] border border-[rgba(26,111,255,0.12)] rounded-lg p-3">
                    <div className="w-7 h-7 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-brand-gold">{c.n}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#e8e8e8]">{c.comp}</p>
                      <p className="text-xs text-[#a0a0a0] mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4 mt-2">
                <p className="text-sm font-semibold text-brand-gold mb-2">Las puertas de la conexión:</p>
                <p className="text-sm text-[#c0c0c0]">Cada comportamiento abre una puerta. Si las 6 están abiertas, el prospecto entra en lo que llamamos el <strong className="text-[#e8e8e8]">bucle de apertura</strong>: cuanto más habla, más se compromete con su propia situación, y más natural se vuelve el cierre.</p>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo activar los 6 comportamientos de conexión de forma consciente en cualquier conversación, no solo cuando "siento" que funciona.' },
            { type: 'error', text: 'Forzar la conexión. Si la curiosidad no es genuina, el prospecto lo siente — y es peor que no hacer nada.' },
          ],
        },
        {
          id: 'pilar2',
          title: 'Pilar 2 — Recolección inteligente de información',
          subtitle: 'Las 4 preguntas previas + 9 dimensiones + 3 hábitos',
          body: (
            <div className="space-y-5">
              <p className="leading-relaxed text-[#c0c0c0]">
                Antes de entrar a las 8 etapas, necesitás mapear el terreno. Estas preguntas previas te dan el contexto para personalizar toda la conversación.
              </p>
              <div>
                <p className="text-sm font-semibold text-brand-gold mb-3">Las 4 preguntas previas:</p>
                <div className="space-y-2">
                  {[
                    '¿Cuánto tiempo lleva con este problema / en esta situación?',
                    '¿Qué intentó antes y por qué no funcionó?',
                    '¿Qué le pasaría si esto no cambia en los próximos 6 meses?',
                    '¿Qué significa para él resolver esto?',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-3 items-start text-sm">
                      <span className="text-brand-gold font-bold shrink-0">{i + 1}.</span>
                      <span className="text-[#c0c0c0]">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-gold mb-3">Las 9 dimensiones a mapear:</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Situación actual', 'Problema principal', 'Síntomas', 'Causa raíz', 'Impacto emocional', 'Urgencia', 'Intentos previos', 'Visión del futuro', 'Decisor real'].map(d => (
                    <div key={d} className="bg-[#0d0d15] border border-[rgba(26,111,255,0.15)] rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-[#c0c0c0]">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-gold mb-3">Los 3 hábitos de recolección:</p>
                {[
                  { h: 'Escuchar sin interrumpir', d: 'Dejás que terminen. Siempre.' },
                  { h: 'Profundizar antes de avanzar', d: 'No pasás al siguiente punto si no entendiste el actual.' },
                  { h: 'Confirmar antes de interpretar', d: 'Repetís lo que escuchaste antes de asumir qué significa.' },
                ].map(h => (
                  <div key={h.h} className="flex gap-3 items-start mb-2 last:mb-0">
                    <CheckCircle2 className="h-4 w-4 text-brand-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-[#e8e8e8]">{h.h}</p>
                      <p className="text-xs text-[#a0a0a0]">{h.d}</p>
                    </div>
                  </div>
                ))}
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
      id: 'etapa01',
      label: 'Etapa 01 — Identificar el interés',
      icon: <Target className="h-4 w-4" />,
      blocks: [
        {
          id: 'e01',
          number: 'E01',
          title: 'Identificar el interés',
          subtitle: 'El primer mapa de la conversación',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                El objetivo de esta etapa es entender <strong className="text-brand-gold">qué trajo al prospecto aquí</strong>. No lo que dicen en frío ("vi tu anuncio"), sino lo que hay detrás: qué situación los llevó a buscar algo diferente.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas de esta etapa:</p>
                <div className="space-y-2">
                  {[
                    '¿Qué te llevó a buscar esto en este momento?',
                    '¿Hubo algo específico que pasó que te hizo tomar acción?',
                    '¿Qué estás buscando que hoy no tenés?',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-brand-gold">→</span>
                      <span className="text-[#c0c0c0] italic">"{p}"</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#a0a0a0]">
                <strong className="text-[#e0e0e0]">Qué buscás en las respuestas:</strong> El evento disparador. El contraste entre lo que tienen y lo que quieren. La emoción detrás del movimiento.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Al final de esta etapa, puedo articular exactamente qué trajo al prospecto aquí y qué emoción hay detrás.' },
            { type: 'error', text: 'Quedarse con la respuesta superficial. Si dicen "quiero ganar más", la siguiente pregunta siempre es "¿por qué ahora?"' },
          ],
        },
      ],
    },
    {
      id: 'etapa02',
      label: 'Etapa 02 — Situación actual',
      icon: <Target className="h-4 w-4" />,
      blocks: [
        {
          id: 'e02',
          number: 'E02',
          title: 'Comprender la situación actual',
          subtitle: 'El contexto desde el que opera el prospecto',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Antes de hablar de cambio, necesitás entender <strong className="text-brand-gold">desde dónde está partiendo</strong> el prospecto. Su situación actual es el punto de referencia para todo lo que viene.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas de esta etapa:</p>
                <div className="space-y-2">
                  {[
                    '¿En qué momento estás hoy en relación a [tema]?',
                    '¿Qué viene funcionando y qué no?',
                    '¿Cuánto tiempo llevás en esta situación?',
                    '¿Qué intentaste para cambiarlo?',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-brand-gold">→</span>
                      <span className="text-[#c0c0c0] italic">"{p}"</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#a0a0a0]">
                <strong className="text-[#e0e0e0]">Señal de que esta etapa está completa:</strong> Podés describir la situación del prospecto mejor de lo que él la describiría.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Tengo un mapa claro de la situación actual del prospecto antes de explorar el problema.' },
            { type: 'error', text: 'Preguntar solo lo superficial. La duración de la situación y los intentos previos son datos críticos que la mayoría no pregunta.' },
          ],
        },
      ],
    },
    {
      id: 'etapa03',
      label: 'Etapa 03 — Detectar síntomas',
      icon: <Target className="h-4 w-4" />,
      blocks: [
        {
          id: 'e03',
          number: 'E03',
          title: 'Detectar los síntomas',
          subtitle: 'Las manifestaciones visibles del problema',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Los síntomas son lo que el prospecto <em>ve</em> del problema. No el problema en sí — las señales externas. Identificarlos tiene dos objetivos: entender la magnitud y <strong className="text-brand-gold">empezar a construir el costo del problema</strong>.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas de esta etapa:</p>
                <div className="space-y-2">
                  {[
                    '¿Cómo se manifiesta esto en tu día a día?',
                    '¿Qué es lo que más te molesta de esta situación?',
                    '¿Hay algo que no podés hacer por esto?',
                    '¿Cómo afecta esto a las personas de tu entorno?',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-brand-gold">→</span>
                      <span className="text-[#c0c0c0] italic">"{p}"</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#a0a0a0]">
                Cuantos más síntomas detectás, más real se vuelve el problema para el prospecto. Esto no es manipulación — es ayudarlos a <em>ver</em> algo que a veces normalizaron.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo identificar al menos 3 síntomas concretos del problema del prospecto, en sus propias palabras.' },
            { type: 'error', text: 'Aceptar un síntoma vago sin profundizar. "Me cuesta vender" no es suficiente — ¿cuándo, cuánto, con qué tipo de cliente?' },
          ],
        },
      ],
    },
    {
      id: 'etapa04',
      label: 'Etapa 04 — El problema real',
      icon: <Target className="h-4 w-4" />,
      blocks: [
        {
          id: 'e04',
          number: 'E04',
          title: 'Encontrar el problema real',
          subtitle: 'Debajo de los síntomas, la causa raíz',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Los síntomas son la superficie. El problema real es la <strong className="text-brand-gold">causa raíz</strong> que genera todos esos síntomas. Esta es la etapa más importante de toda la cualificación.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                Un prospecto que describe síntomas no sabe necesariamente cuál es el problema real. Tu trabajo es ayudarlos a llegar ahí — a través de preguntas, no de afirmaciones.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas de esta etapa:</p>
                <div className="space-y-2">
                  {[
                    '¿Si tuvieras que identificar una sola causa de todo esto, cuál sería?',
                    '¿Qué creés que está en el origen de esta situación?',
                    '¿Cuándo empezó esto — hubo algo que lo desencadenó?',
                    '¿Qué pasaría si resolvés [síntoma] pero no [causa]?',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-brand-gold">→</span>
                      <span className="text-[#c0c0c0] italic">"{p}"</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#1a0f2e] border border-[rgba(150,100,255,0.20)] rounded-lg p-3 mt-2">
                <p className="text-sm text-[#c0a0ff]">
                  <strong>Insight clave:</strong> Cuando el prospecto nombra el problema real con sus propias palabras, ya está comprometido con resolverlo. No necesitás convencerlos — ya se convencieron solos.
                </p>
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
      id: 'etapa05',
      label: 'Etapa 05 — Impacto emocional',
      icon: <Target className="h-4 w-4" />,
      blocks: [
        {
          id: 'e05',
          number: 'E05',
          title: 'Comprender el impacto emocional',
          subtitle: 'La dimensión que convierte información en motivación',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Los hechos informan. Las emociones mueven. Esta etapa conecta el problema real con <strong className="text-brand-gold">cómo se siente el prospecto</strong> al vivir esa situación.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                No es manipulación emocional — es reconocimiento de que las personas toman decisiones desde las emociones y las justifican con lógica. Si ignorás la dimensión emocional, estás perdiendo el 80% de lo que mueve a actuar.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas de esta etapa:</p>
                <div className="space-y-2">
                  {[
                    '¿Cómo te hace sentir estar en esta situación?',
                    '¿Qué es lo que más te pesa de todo esto?',
                    '¿Afecta esto cómo te ves a vos mismo / a tu familia?',
                    '¿Hay algo de esto de lo que no hablaste mucho con otros?',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-brand-gold">→</span>
                      <span className="text-[#c0c0c0] italic">"{p}"</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#a0a0a0]">
                Después de esta etapa, el prospecto suele estar más abierto que en cualquier otra parte de la conversación. Es el momento de más conexión — no lo desperdicies con argumentos.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Puedo articular el impacto emocional del problema del prospecto con más precisión que él mismo.' },
            { type: 'error', text: 'Ignorar la emoción porque "es una conversación de negocios". Toda conversación de negocios es también una conversación humana.' },
          ],
        },
      ],
    },
    {
      id: 'etapa06',
      label: 'Etapa 06 — Acompañamiento',
      icon: <Target className="h-4 w-4" />,
      blocks: [
        {
          id: 'e06',
          number: 'E06',
          title: 'Acompañamiento y entendimiento',
          subtitle: 'El puente entre el diagnóstico y la solución',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Esta etapa es una transición. Después de haber explorado el problema real y el impacto emocional, el prospecto necesita sentir que <strong className="text-brand-gold">fue escuchado y entendido</strong> antes de que puedas hablar de cualquier solución.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-gold mb-3">Movimientos de esta etapa:</p>
                <div className="space-y-3">
                  {[
                    { m: 'Resumen empático', d: 'Repetís todo lo que escuchaste — situación, síntomas, problema real, impacto — en sus propias palabras.' },
                    { m: 'Validación', d: 'Reconocés que lo que describieron es real y comprensible. No minimizás, no exagerás.' },
                    { m: 'Pregunta de confirmación', d: '"¿Sentís que capturé bien lo que me estás contando?" — Siempre.' },
                  ].map(m => (
                    <div key={m.m} className="flex gap-3 items-start">
                      <ArrowRight className="h-4 w-4 text-brand-gold mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-[#e8e8e8]">{m.m}</p>
                        <p className="text-xs text-[#a0a0a0]">{m.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#a0a0a0]">
                Este paso es donde el 90% de los vendedores se saltan directo a la presentación. Es el error más caro de toda la conversación.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Antes de hablar de la solución, siempre resumo lo que escuché y espero confirmación del prospecto.' },
            { type: 'error', text: 'Pasar directo de detectar el problema a presentar la solución. El prospecto no sintió que lo entendiste — y eso invalida todo lo que sigue.' },
          ],
        },
      ],
    },
    {
      id: 'etapa07',
      label: 'Etapa 07 — Justificar con lógica',
      icon: <Target className="h-4 w-4" />,
      blocks: [
        {
          id: 'e07',
          number: 'E07',
          title: 'Justificar con lógica',
          subtitle: 'El componente racional que sostiene la decisión emocional',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Las personas deciden emocionalmente y justifican con lógica. Esta etapa es donde le das al prospecto las <strong className="text-brand-gold">herramientas lógicas</strong> para justificar su decisión ante sí mismo y ante otros.
              </p>
              <p className="leading-relaxed text-[#c0c0c0]">
                No es el momento de hablar de funcionalidades. Es el momento de hablar de <em>consecuencias</em> de no actuar y de <em>resultados concretos</em> de actuar.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-gold mb-3">Preguntas de esta etapa:</p>
                <div className="space-y-2">
                  {[
                    '¿Qué te costaría seguir igual 6 meses más?',
                    '¿Si esto se resuelve, cómo cambia tu situación concretamente?',
                    '¿Tiene sentido para vos invertir en resolver esto ahora?',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-brand-gold">→</span>
                      <span className="text-[#c0c0c0] italic">"{p}"</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#a0a0a0]">
                Cuando el prospecto puede articular el costo de no actuar, el precio de la solución se vuelve relativo. Esa es la magia de esta etapa.
              </p>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'El prospecto puede articular el costo de no actuar con más detalle del que yo podría describir.' },
            { type: 'error', text: 'Usar tu propia lógica para justificar la inversión. Tiene que ser LA LÓGICA DEL PROSPECTO — que venga de ellos.' },
          ],
        },
      ],
    },
    {
      id: 'etapa08',
      label: 'Etapa 08 — Aportar valor',
      icon: <Target className="h-4 w-4" />,
      blocks: [
        {
          id: 'e08',
          number: 'E08',
          title: 'Aportar valor',
          subtitle: 'La presentación calibrada — no genérica',
          body: (
            <div className="space-y-4">
              <p className="leading-relaxed text-[#c0c0c0]">
                Recién en esta etapa hablás de tu solución. Y cuando lo hacés, no es un pitch genérico — es una presentación <strong className="text-brand-gold">construida con las palabras del prospecto</strong>: su situación, su problema, su impacto emocional.
              </p>
              <div className="bg-[#0f1a2e] border border-[rgba(26,111,255,0.20)] rounded-lg p-4">
                <p className="text-sm font-semibold text-brand-gold mb-3">Estructura de la presentación:</p>
                <div className="space-y-3">
                  {[
                    { t: '1. Reconectar con el problema', d: '"Dijiste que lo que más te pesa es X. Esto que vamos a ver está diseñado exactamente para eso."' },
                    { t: '2. Presentar la solución en términos de resultados', d: 'No funcionalidades — qué cambia en su vida/trabajo.' },
                    { t: '3. Conectar cada punto con algo que dijeron', d: 'Cada beneficio debe tener un ancla en algo que el prospecto expresó.' },
                    { t: '4. Pausar y preguntar', d: '"¿Cómo ves esto en relación a lo que me contaste?"' },
                  ].map(s => (
                    <div key={s.t} className="border-l-2 border-brand-gold/40 pl-3">
                      <p className="text-sm font-semibold text-[#e8e8e8]">{s.t}</p>
                      <p className="text-xs text-[#a0a0a0] mt-0.5 italic">{s.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: 'Mi presentación está hecha 100% con las palabras y situación del prospecto — nadie recibe el mismo pitch.' },
            { type: 'error', text: 'Hacer el pitch genérico que hacés con todos. El prospecto siente que no los escuchaste — porque en esa etapa, no los escuchaste.' },
          ],
        },
      ],
    },
    {
      id: 'cierre02',
      label: 'Cierre — Reglas y Tablero',
      icon: <Award className="h-4 w-4" />,
      blocks: [
        {
          id: 'reglas-02',
          title: 'Reglas transversales de la cualificación',
          subtitle: 'Las 7 reglas que sostienen el sistema',
          body: (
            <div className="space-y-3">
              {[
                { n: 1, regla: 'Las etapas no son opcionales', desc: 'Podés acelerarlas, pero no saltearlas. Cada etapa construye la siguiente.' },
                { n: 2, regla: 'El orden importa', desc: 'Síntomas antes que causa raíz. Emoción antes de lógica. Lógica antes de solución.' },
                { n: 3, regla: 'Nunca presentes sin haber entendido', desc: 'Si no pasaste por E01-E06, tu presentación es una apuesta, no una solución.' },
                { n: 4, regla: 'Sus palabras, no las tuyas', desc: 'Todo lo que articulés sobre el problema tiene que venir de lo que ellos dijeron.' },
                { n: 5, regla: 'La curiosidad es técnica', desc: 'No es una habilidad innata — es un conjunto de comportamientos que se practican.' },
                { n: 6, regla: 'El cierre es una confirmación, no un evento', desc: 'Si el sistema funcionó, el cierre es la consecuencia lógica de todo lo anterior.' },
                { n: 7, regla: 'Lo que no se mide no se mejora', desc: 'Después de cada llamada, revisá qué etapa estuvo débil. Ahí está tu próxima mejora.' },
              ].map(r => (
                <div key={r.n} className="flex gap-4 items-start bg-[#0f1420] border border-[rgba(26,111,255,0.15)] rounded-lg p-4">
                  <div className="w-8 h-8 rounded-full bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-brand-gold">{r.n}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#e8e8e8] mb-1">{r.regla}</p>
                    <p className="text-sm text-[#a0a0a0]">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'tablero-02',
          title: 'Tablero de verificación',
          subtitle: '¿Completaste cada etapa correctamente?',
          body: (
            <div className="space-y-2">
              {[
                { etapa: 'E01', check: 'Sé qué trajo al prospecto aquí y qué emoción hay detrás' },
                { etapa: 'E02', check: 'Tengo un mapa claro de su situación actual (duración, intentos previos, lo que funciona)' },
                { etapa: 'E03', check: 'Identifiqué al menos 3 síntomas concretos del problema' },
                { etapa: 'E04', check: 'El prospecto articuló el problema real con sus propias palabras' },
                { etapa: 'E05', check: 'Entiendo el impacto emocional — cómo se siente vivir esa situación' },
                { etapa: 'E06', check: 'Resumí lo que escuché y el prospecto confirmó que lo capturé bien' },
                { etapa: 'E07', check: 'El prospecto puede articular el costo de no actuar con sus propias palabras' },
                { etapa: 'E08', check: 'Mi presentación está construida con sus palabras y mapea su situación específica' },
                { etapa: 'P1', check: 'Mantuve los 6 comportamientos de conexión genuina durante toda la conversación' },
                { etapa: 'P2', check: 'Tengo información de las 9 dimensiones antes de presentar cualquier solución' },
              ].map(c => (
                <div key={c.etapa} className="flex items-start gap-3 bg-[#0d0d0d] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-3">
                  <div className="w-10 h-6 rounded bg-[rgba(26,111,255,0.15)] border border-[rgba(26,111,255,0.30)] flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-brand-gold">{c.etapa}</span>
                  </div>
                  <p className="text-sm text-[#c0c0c0]">{c.check}</p>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'errores-02',
          title: 'Errores que invalidan el diagnóstico',
          body: (
            <div className="space-y-3">
              {[
                { error: 'Saltar etapas', consecuencia: 'Cada etapa que saltás es un agujero en tu diagnóstico. Un diagnóstico incompleto lleva a cierres forzados.' },
                { error: 'Presentar antes de la E06', consecuencia: 'Si presentás sin acompañamiento, el prospecto siente que no fue escuchado — y tiene razón.' },
                { error: 'Usar tus palabras en lugar de las suyas', consecuencia: 'La conversación deja de ser sobre ellos y empieza a ser sobre vos.' },
                { error: 'No profundizar en el impacto emocional', consecuencia: 'Sin emoción, la decisión no tiene urgencia real.' },
                { error: 'Hacer el mismo pitch para todos', consecuencia: 'Si tu presentación no menciona nada de lo que dijeron, es que no diagnosticaste — presentaste.' },
                { error: 'Cerrar sin confirmar la lógica (E07)', consecuencia: 'El prospecto tiene la emoción pero no la justificación racional → "lo pienso" → se cae.' },
              ].map(e => (
                <div key={e.error} className="bg-[#1a0a0a] border border-[rgba(255,60,60,0.20)] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-4 w-4 text-[#ff6b6b] mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-[#e8e8e8] text-sm">{e.error}</p>
                      <p className="text-xs text-[#a0a0a0] mt-1">{e.consecuencia}</p>
                    </div>
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

const MANUALS = [MANUAL_01, MANUAL_02];

// ─── COMPONENTES UI ────────────────────────────────────────────────────────────

function CalloutBox({ callout }: { callout: Callout }) {
  const config = {
    dominio: { bg: 'bg-[#0f1a2e]', border: 'border-[rgba(26,111,255,0.30)]', icon: <Target className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />, label: 'Criterio de dominio', labelColor: 'text-brand-gold' },
    error: { bg: 'bg-[#1a0a0a]', border: 'border-[rgba(255,60,60,0.30)]', icon: <AlertTriangle className="h-4 w-4 text-[#ff6b6b] shrink-0 mt-0.5" />, label: 'Error frecuente', labelColor: 'text-[#ff6b6b]' },
    tip: { bg: 'bg-[#0f1a0f]', border: 'border-[rgba(26,200,100,0.30)]', icon: <Lightbulb className="h-4 w-4 text-[#6bff8a] shrink-0 mt-0.5" />, label: 'Tip práctico', labelColor: 'text-[#6bff8a]' },
    regla: { bg: 'bg-[#1a0f2e]', border: 'border-[rgba(150,100,255,0.30)]', icon: <Shield className="h-4 w-4 text-[#c0a0ff] shrink-0 mt-0.5" />, label: 'Regla', labelColor: 'text-[#c0a0ff]' },
  }[callout.type];

  return (
    <div className={cn('rounded-xl border p-4 flex gap-3', config.bg, config.border)}>
      {config.icon}
      <div>
        <p className={cn('text-xs font-bold uppercase tracking-wider mb-1', config.labelColor)}>{config.label}</p>
        <p className="text-sm text-[#c8c8c8] leading-relaxed">{callout.text}</p>
      </div>
    </div>
  );
}

function BlockCard({ block }: { block: Block }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        {block.number && (
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/25 shrink-0">
            <span className="text-lg font-black text-brand-gold">{block.number}</span>
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#f0f0f0] leading-tight">{block.title}</h2>
          {block.subtitle && <p className="text-sm text-[#888] mt-0.5">{block.subtitle}</p>}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-brand-gold/30 via-brand-gold/10 to-transparent" />

      {/* Body */}
      <div>{block.body}</div>

      {/* Callouts */}
      {block.callouts && block.callouts.length > 0 && (
        <div className="space-y-3 pt-2">
          {block.callouts.map((c, i) => <CalloutBox key={i} callout={c} />)}
        </div>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export function ManualViewer() {
  const [activeManual, setActiveManual] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeBlock, setActiveBlock] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const manual = MANUALS[activeManual];
  const chapter = manual.chapters[activeChapter];
  const block = chapter?.blocks[activeBlock];

  // Flatten all blocks for prev/next
  const allBlocks: { manualIdx: number; chapterIdx: number; blockIdx: number }[] = [];
  MANUALS.forEach((m, mi) => m.chapters.forEach((c, ci) => c.blocks.forEach((_, bi) => allBlocks.push({ manualIdx: mi, chapterIdx: ci, blockIdx: bi }))));

  const currentFlatIdx = allBlocks.findIndex(b => b.manualIdx === activeManual && b.chapterIdx === activeChapter && b.blockIdx === activeBlock);
  const totalBlocks = allBlocks.length;
  const progress = ((currentFlatIdx + 1) / totalBlocks) * 100;

  function navigate(delta: number) {
    const next = allBlocks[currentFlatIdx + delta];
    if (!next) return;
    setActiveManual(next.manualIdx);
    setActiveChapter(next.chapterIdx);
    setActiveBlock(next.blockIdx);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setSidebarOpen(false);
  }

  function goTo(mi: number, ci: number, bi: number) {
    setActiveManual(mi);
    setActiveChapter(ci);
    setActiveBlock(bi);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setSidebarOpen(false);
  }

  const isActive = (mi: number, ci: number, bi: number) => mi === activeManual && ci === activeChapter && bi === activeBlock;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#050505] overflow-hidden relative">

      {/* ── Overlay mobile ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={cn(
        'fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto w-72 flex flex-col bg-[#080810] border-r border-[rgba(26,111,255,0.12)] transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Manual selector */}
        <div className="p-4 border-b border-[rgba(26,111,255,0.12)]">
          <div className="flex gap-2">
            {MANUALS.map((m, i) => (
              <button
                key={m.id}
                onClick={() => { setActiveManual(i); setActiveChapter(0); setActiveBlock(0); setSidebarOpen(false); }}
                className={cn(
                  'flex-1 rounded-lg py-2 px-3 text-xs font-bold transition-all',
                  activeManual === i
                    ? 'bg-brand-gold text-white shadow-[0_0_16px_rgba(26,111,255,0.4)]'
                    : 'bg-[#111] text-[#888] hover:text-[#ccc] border border-[rgba(255,255,255,0.06)]'
                )}
              >
                Manual {m.number}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#666] mt-3 px-1 leading-tight">{manual.title}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {manual.chapters.map((ch, ci) => (
            <div key={ch.id} className="space-y-0.5">
              {/* Chapter header */}
              <div className="flex items-center gap-2 px-2 py-1.5 mt-2 first:mt-0">
                <div className="text-brand-gold/60 shrink-0">{ch.icon}</div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#555] leading-tight">{ch.label}</p>
              </div>
              {/* Blocks */}
              {ch.blocks.map((bl, bi) => (
                <button
                  key={bl.id}
                  onClick={() => goTo(activeManual, ci, bi)}
                  className={cn(
                    'w-full text-left flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all text-sm',
                    isActive(activeManual, ci, bi)
                      ? 'bg-[rgba(26,111,255,0.15)] text-[#e8e8e8] border border-[rgba(26,111,255,0.30)] shadow-[0_0_12px_rgba(26,111,255,0.12)]'
                      : 'text-[#888] hover:bg-[#111] hover:text-[#ccc] border border-transparent'
                  )}
                >
                  {isActive(activeManual, ci, bi)
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-brand-gold shrink-0" />
                    : <Circle className="h-3.5 w-3.5 text-[#444] shrink-0" />
                  }
                  <span className="truncate leading-tight">{bl.title}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Progress */}
        <div className="p-4 border-t border-[rgba(26,111,255,0.12)]">
          <div className="flex justify-between text-xs text-[#555] mb-2">
            <span>Progreso total</span>
            <span className="text-brand-gold font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-[#111] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1a6fff] to-[#4d8fff] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(26,111,255,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-[#444] mt-2 text-center">{currentFlatIdx + 1} / {totalBlocks} secciones</p>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(26,111,255,0.10)] bg-[#080808] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-[#888] hover:text-[#e8e8e8] hover:bg-[#111] transition"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-[#555] min-w-0 flex-1">
            <span className="text-brand-gold font-semibold shrink-0">Manual {manual.number}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="truncate">{chapter?.label}</span>
            {block?.title !== chapter?.label && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0" />
                <span className="truncate text-[#888]">{block?.title}</span>
              </>
            )}
          </div>

          {/* Prev / Next */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => navigate(-1)}
              disabled={currentFlatIdx === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#888] hover:text-[#e8e8e8] hover:bg-[#111] transition disabled:opacity-30 disabled:cursor-not-allowed border border-transparent hover:border-[rgba(255,255,255,0.06)]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              onClick={() => navigate(1)}
              disabled={currentFlatIdx === totalBlocks - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-gold text-white hover:bg-[#1560e8] transition disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(26,111,255,0.35)]"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar top */}
        <div className="h-0.5 bg-[#111] shrink-0">
          <div
            className="h-full bg-gradient-to-r from-[#1a6fff] to-[#4d8fff] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {block && <BlockCard block={block} />}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="border-t border-[rgba(26,111,255,0.10)] bg-[#080808] px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => navigate(-1)}
            disabled={currentFlatIdx === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[#888] hover:text-[#e8e8e8] hover:bg-[#111] transition disabled:opacity-30 border border-transparent hover:border-[rgba(255,255,255,0.06)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          <div className="text-xs text-[#444]">
            {currentFlatIdx + 1} de {totalBlocks}
          </div>

          <button
            onClick={() => navigate(1)}
            disabled={currentFlatIdx === totalBlocks - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-brand-gold text-white hover:bg-[#1560e8] transition disabled:opacity-30 shadow-[0_0_12px_rgba(26,111,255,0.35)]"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
