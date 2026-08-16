'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronRight, ChevronLeft, AlertTriangle, Target,
  Brain, Zap, Eye, Shield, MessageSquare, BookOpen,
} from 'lucide-react';

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

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-relaxed text-brand-muted">{children}</p>;
}
function H({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-brand-gold mt-5 mb-2">{children}</p>;
}
function Li({ children }: { children: React.ReactNode }) {
  return <li className="leading-relaxed text-brand-muted">{children}</li>;
}
function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc list-inside space-y-1.5">{children}</ul>;
}
function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-brand-gold/40 pl-4 py-1 my-4 text-brand-text italic text-sm leading-relaxed">
      {children}
    </blockquote>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2 border-b border-white/5">
      <span className="text-brand-gold font-semibold text-xs w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-brand-muted text-sm leading-relaxed">{value}</span>
    </div>
  );
}

// ─── MANUAL 01 ────────────────────────────────────────────────────────────────

const M01: Manual = {
  id: 'm01',
  number: '01',
  title: 'Fundamentos de la Conversación Comercial',
  subtitle: 'Los cuatro bloques — los doce principios sobre los que se apoya todo diagnóstico',
  description: 'Esto no es un manual de técnicas. Es el manual que explica por qué las técnicas funcionan. Sin él, todo lo que viene después se memoriza; con él, se entiende.',
  chapters: [
    {
      id: 'apertura',
      label: 'Apertura',
      short: 'Apertura',
      icon: <BookOpen className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'uso',
          title: 'Cómo se usa este manual',
          body: (
            <div className="space-y-4">
              <P>Hay una diferencia enorme entre saber qué hacer y saber por qué se hace. A un vendedor se le puede decir en treinta segundos que se vista bien, que sonría y que la llamada se define en los primeros segundos. Es cierto, es corto y no sirve para nada. Quien recibe esa instrucción sin entenderla se pone una sonrisa que no siente, y esa sonrisa lo delata más rápido que si no hubiera sonreído.</P>
              <P>Por eso este manual va al revés de como se enseña habitualmente. Primero el mecanismo, después la indicación. Cuando el mecanismo está claro, la indicación deja de ser una regla que hay que recordar y pasa a ser una consecuencia obvia.</P>
              <H>Regla de lectura</H>
              <P>Cada concepto cierra con un criterio de dominio: una prueba que hay que poder superar antes de darlo por incorporado. No es una pregunta de comprensión. Es una demostración. Si no podés responderla con un ejemplo propio y concreto, el concepto está leído pero no instalado, y leído no alcanza para nada.</P>
              <H>Cómo está organizado</H>
              <div className="space-y-2">
                <Row label="Bloque 01 · La llamada" value="El entorno donde ocurre todo: la conversación, el terreno compartido y el interés que la mueve." />
                <Row label="Bloque 02 · La información" value="La mecánica del intercambio: quién emite, quién recibe, por qué canal y bajo qué condición se comprenden." />
                <Row label="Bloque 03 · La percepción" value="Qué ocurre entre el dato y la interpretación, y por qué eso convierte a la suposición en el error más caro." />
                <Row label="Bloque 04 · El operador" value="Cómo tomar control: los primeros segundos, el propio estado y el marco ético que ordena el uso de todo lo anterior." />
              </div>
              <H>Lo que este manual cubre y lo que no</H>
              <P>Acá están los fundamentos: qué ocurre entre dos personas cuando conversan y por qué. La estructura del diagnóstico —las ocho etapas de una cualificación, los criterios de avance, la construcción de la propuesta— se trabaja en el Manual 02. La ejecución fina —formulación de preguntas abiertas, guiadas y cerradas, manejo del hilo conversacional, tonalidad, detección de palabras clave— se entrena aparte, sobre esta base.</P>
              <P>El orden no es arbitrario ni administrativo. Un alumno que empieza por la estructura de cualificación sin estos fundamentos se lleva ocho etapas y las recita. Un alumno que empieza por acá entiende para qué existe cada etapa antes de conocerla, y entonces la aplica con criterio propio.</P>
              <H>Una aclaración sobre las analogías</H>
              <P>A lo largo del manual se usan analogías —la radio, la antena, el espejo— porque explican rápido y se recuerdan. Son analogías, no descripciones físicas de lo que ocurre. Se usan para entender el mecanismo, no para explicarlo delante de un prospecto. Una analogía dicha como si fuera un hecho científico destruye en dos segundos la autoridad que se tardó media hora en construir.</P>
            </div>
          ),
        },
        {
          id: 'principio',
          title: 'Principio fundamental',
          subtitle: 'La conversación es el entorno de toda venta',
          body: (
            <div className="space-y-4">
              <Quote>Nadie puede diagnosticar a otro sin entender primero cómo esa persona construye su realidad.</Quote>
              <P>Toda venta ocurre adentro de una conversación. La técnica se ejecuta ahí, no en otro lado. Si la conversación se rompe, no hay estructura que la sostenga.</P>
              <H>Tres consecuencias que ordenan todo</H>
              <P><span className="text-brand-text font-semibold">Primera:</span> la conversación es el entorno, no una etapa. No es lo que se hace al principio para romper el hielo y después se abandona. Es el medio en el que sucede todo lo importante.</P>
              <P><span className="text-brand-text font-semibold">Segunda:</span> el intercambio empieza antes de la primera palabra. Ropa, encuadre, luz, ruido de fondo, postura, gesto — toda esa información entra y se procesa antes de que exista una sola frase.</P>
              <P><span className="text-brand-text font-semibold">Tercera:</span> lo que el otro entiende no es lo que vos dijiste. Entre el dato que emitís y la conclusión que el otro saca hay un procesamiento entero que no conocés y que no podés adivinar. De ahí sale la regla más cara: preguntar en vez de asumir.</P>
              <H>Las cuatro competencias</H>
              <div className="space-y-2">
                <Row label="Entendimiento del intercambio" value="Base. Explica por qué funciona todo lo demás. Sin esto, el resto son reglas sueltas que se olvidan bajo presión." />
                <Row label="Lectura" value="Permanente. Detecta lo que la persona no dice: el gesto, el cambio de ritmo, la puerta que se cierra." />
                <Row label="Transmisión" value="Permanente. Controla lo que emitís, con la boca abierta y con la boca cerrada." />
                <Row label="Verificación" value="Progresiva. Convierte suposición en dato. Es lo que hace que un diagnóstico sea diagnóstico." />
              </div>
              <P>Dos permanecen y dos avanzan. El error habitual es tratar la lectura y la transmisión como algo que se resuelve en el primer minuto y después atropellar el resto de la conversación. La transmisión no se hace: se sostiene.</P>
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
          id: 'c01',
          number: '01',
          title: 'La llamada es una conversación',
          subtitle: 'Estructura, lógica y propósito',
          body: (
            <div className="space-y-4">
              <P>Todo lo que se enseña en ventas —el orden de las preguntas, la profundización, el manejo de una objeción, la presentación de una propuesta— se ejecuta adentro de una conversación. La conversación no es una de las herramientas: es la mesa sobre la que están apoyadas todas las herramientas.</P>
              <P>Quien no tiene este concepto claro comete siempre el mismo error: prepara excelentes preguntas y las ejecuta en orden, sin advertir que el orden de la lista y el orden de la conversación son dos cosas distintas. Quien recita hace la pregunta que sigue en la lista. Quien conversa hace la pregunta que sigue a la respuesta anterior.</P>
              <H>Las tres condiciones</H>
              <Row label="Estructura" value="Hay un orden en el que las cosas tienen sentido y otro en el que no. La estructura vive en tu cabeza, no en la conversación: la conversación puede ir y venir, la estructura queda intacta." />
              <Row label="Lógica" value="Cada cosa que decís se conecta con lo anterior. No hay saltos de tema para llenar silencios ni preguntas que podrían hacerse a cualquier otra persona." />
              <Row label="Propósito" value="Vos entrás sabiendo a dónde tiene que llegar la conversación. Un propósito claro es lo que te permite salir con la persona por una rama y volver sin haber perdido el hilo." />
              <H>La frase que hay que retener</H>
              <Quote>Dos personas hablando no es una conversación.</Quote>
              <P>Lo que convierte ese ruido en conversación es que exista un punto donde los dos temas se tocan. Comunicación viene de común. Sin algo en común no hay comunicación, y sin comunicación no hay conversación: hay dos monólogos alternados que terminan cuando uno de los dos se cansa de sostener la cortesía.</P>
              <H>Qué observar</H>
              <Ul>
                <Li>La longitud de las respuestas a lo largo del tiempo. Si se acortan progresivamente, la conversación se está apagando.</Li>
                <Li>Quién llena los silencios. Si los llenás vos hablando de tu solución, perdiste el terreno común.</Li>
                <Li>Si tu pregunta siguiente se apoya en la respuesta anterior o podría haberse hecho igual antes de escucharla.</Li>
                <Li>Si la persona te corrige, te amplía o se va por una rama. Eso es señal de conversación viva.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Tratar la conversación como preámbulo · ejecutar el orden de la lista en lugar del orden de la conversación · confundir cordialidad con conversación · cortar a la persona cuando "se va por las ramas", que es justamente donde suele estar la información que no venía preparada.' },
            { type: 'dominio', text: 'Explicá, sin usar la palabra "conversación", qué diferencia una llamada de ventas de una charla entre amigos. Después escuchá una grabación propia y señalá el minuto exacto en el que dejaste de conversar y empezaste a interrogar.' },
          ],
        },
        {
          id: 'c02',
          number: '02',
          title: 'El punto en común',
          subtitle: 'El terreno donde la comunicación existe',
          body: (
            <div className="space-y-4">
              <P>Si el punto en común fuera una coincidencia afortunada —los dos hinchas del mismo equipo, los dos con perro— entonces vender bien sería cuestión de suerte y no habría nada que enseñar. No lo es.</P>
              <H>Dato compartido vs. territorio compartido</H>
              <P>Un dato compartido es una coincidencia biográfica. Sirve, es agradable cuando aparece y no se puede construir un método sobre eso.</P>
              <P>Un territorio compartido es otra cosa: es un terreno que existe en el cien por ciento de las llamadas. Y ese territorio siempre es el mismo: esa persona está ahí por un problema, y vos estás ahí porque te dedicás a resolver exactamente ese tipo de problema.</P>
              <Quote>El punto en común no es tu solución: es su problema.</Quote>
              <P>Si entrás hablando de lo que hacés, de tu método o de tus resultados, estás poniendo el terreno común de tu lado de la cancha. Y la persona no está de tu lado: está adentro de su problema.</P>
              <H>Los tres niveles</H>
              <Row label="Nivel 1 · Humano" value="El clima, el mate, el perro que ladra. Función limitada: bajar la guardia. Es un puente, no un destino. Profundizar acá hace perder tiempo." />
              <Row label="Nivel 2 · Situacional" value="Estás acá porque hay algo que querés cambiar. Acá empieza el territorio real: la persona empieza a contar hechos, qué hace, qué resultados obtiene, qué intentó antes." />
              <Row label="Nivel 3 · Emocional" value="Cuando la persona nombra lo que siente y vos se lo devolvés sin juzgarlo ni corregirlo. Es el más profundo y el más frágil: se llega por acumulación de los dos anteriores." />
              <H>La regla de autenticidad</H>
              <P>El punto en común tiene que ser real. Un interés inventado para caer bien produce incongruencia entre lo que decís y lo que transmite el resto de tu cuerpo. La otra persona rara vez identifica qué fue lo que no cerró, pero registra que algo no cerró. Y a partir de ese momento deja de contar cosas.</P>
              <P>El costo de esa incongruencia no es perder la venta. Es perder la confianza, que es un activo mucho más caro y que, a diferencia de la venta, no se recupera en la llamada siguiente.</P>
              <H>Qué observar</H>
              <Ul>
                <Li>En qué segundo apareció el primer punto en común real. Es una métrica, se puede medir en una grabación y baja con el entrenamiento.</Li>
                <Li>Quién lo introdujo. Si siempre lo introduce el prospecto, estás dependiendo de que te toquen prospectos fáciles.</Li>
                <Li>Si la persona amplió el terreno por su cuenta. Cuando alguien agrega contexto que no le pediste, el terreno está construido.</Li>
                <Li>Si te quedaste en el nivel 1 toda la llamada. Es cómodo, se siente bien y no produce diagnóstico.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Salir a buscar coincidencias biográficas en lugar de construir territorio · poner el punto en común del lado de la solución y no del problema · quedarse en el nivel humano porque es el más cómodo · encontrar el terreno y saltar inmediatamente a la propuesta · fingir un interés que no se tiene.' },
            { type: 'dominio', text: 'Nombrá el punto en común de tus últimas tres conversaciones comerciales, decí en qué segundo apareció y quién lo introdujo. Después describí cómo construirías territorio compartido con un prospecto del que no sabés absolutamente nada, sin usar ninguna coincidencia biográfica.' },
          ],
        },
        {
          id: 'c03',
          number: '03',
          title: 'El interés',
          subtitle: 'El motor que sostiene el intercambio',
          body: (
            <div className="space-y-4">
              <P>Casi todos recibimos de chicos la misma indicación: no seas interesado. Esa frase instala una creencia que después estorba en el trabajo: que el interés es algo poco noble, que conviene disimular. Y quien cree eso hace dos cosas que arruinan una cualificación: esconde el suyo, y evita medir el del otro.</P>
              <H>El interés como motor</H>
              <P>El ser humano se mueve por dos cosas: escapa de algo o va hacia algo. Miedo e interés. No hay una tercera. Cualquier acción de cualquier día responde a alguna de las dos.</P>
              <H>El interés como instrumento de diagnóstico</H>
              <Quote>¿Esta persona tiene interés real en resolver esto?</Quote>
              <P>Si lo tiene, tu trabajo es acompañarla a ver el camino. Si no lo tiene, tu trabajo es cerrar la conversación con respeto. Las dos son ejecuciones correctas del mismo trabajo.</P>
              <P>Cuando no hay interés, el vendedor lo fabrica: aprieta, genera urgencia artificial, empuja. Y consigue una compra desde el miedo. Todo lo que se compra por miedo se arrepiente. Todo lo que se arrepiente pide reembolso, no aplica el programa y después habla mal del proveedor.</P>
              <H>El interés se mide por hechos, no por declaraciones</H>
              <Ul>
                <Li>Qué intentó antes de llegar a esta conversación, y cuántas veces.</Li>
                <Li>Cuánto tiempo, dinero o energía ya invirtió en el problema.</Li>
                <Li>Qué dejó de hacer hoy para estar en esta llamada.</Li>
                <Li>Con qué precisión puede describir lo que le pasa. Un problema que duele se describe con detalle; uno que no duele se describe con generalidades.</Li>
                <Li>Si vuelve solo al tema cuando la conversación se aleja de él.</Li>
              </Ul>
              <H>El interés es de los dos lados</H>
              <P>Si la persona no te interesa genuinamente, se nota. Se nota en las preguntas que no hacés, en el ritmo con que esperás que termine de hablar, en la ausencia de curiosidad real. La curiosidad no se simula: es consecuencia del interés.</P>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Preguntar directamente si le interesa y tomar la respuesta como dato · fabricar urgencia cuando el diagnóstico no la encontró · confundir cortesía con interés · no revisar el interés propio antes de conectarse.' },
            { type: 'dominio', text: 'Tomá tu última conversación comercial y listá tres hechos —no declaraciones— que prueben el interés real de esa persona. Si no podés listar tres, no mediste interés: escuchaste cortesía.' },
          ],
        },
      ],
    },
    {
      id: 'bloque02',
      label: 'Bloque 02',
      short: 'La información',
      icon: <Zap className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'c04',
          number: '04',
          title: 'Emisor, receptor y canal',
          subtitle: 'La mecánica del intercambio',
          body: (
            <div className="space-y-4">
              <P>La utilidad de este bloque es que convierte problemas que parecen de personalidad en problemas de ingeniería. &ldquo;No conecto con la gente&rdquo; no es un rasgo de carácter: es una descripción vaga de una falla que se puede localizar.</P>
              <H>Los roles se alternan</H>
              <P>En una conversación no hay un emisor fijo y un receptor fijo. Los roles se intercambian permanentemente. La consecuencia operativa es doble: mientras hablás, estás recibiendo; y mientras escuchás, estás emitiendo. Nunca estás en un solo rol.</P>
              <H>Los cuatro canales simultáneos</H>
              <Row label="Canal verbal" value="Las palabras: lo que decidiste decir. Es el único canal que la mayoría prepara y el que menos pesa cuando hay contradicción entre canales." />
              <Row label="Canal tonal" value="Ritmo, volumen, pausas, entonación, velocidad. Comunica estado, seguridad y nivel de interés con más precisión que las palabras." />
              <Row label="Canal visual" value="Encuadre, luz, ropa, postura, gesto, mirada, quietud. Es el primero en llegar y el que arma la hipótesis inicial sobre quién sos." />
              <Row label="Canal contextual" value="El fondo, el ruido, las interrupciones, la calidad del audio. Comunica cuánta importancia le diste a esta conversación." />
              <Quote>La calidad percibida de un mensaje la define el canal peor cuidado, no el mejor.</Quote>
              <H>El ruido</H>
              <Row label="Ruido técnico" value="Audio malo, cámara en contraluz, micrófono lejos. El más fácil de corregir y el más imperdonable." />
              <Row label="Ruido ambiental" value="Gente atrás, televisión, obra, interrupciones. Comunica desorganización aunque no la haya." />
              <Row label="Ruido interno" value="Lo que está pasando en tu cabeza mientras la persona habla. El más caro porque hace perder información irrecuperable." />
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Creer que solo se emite cuando se habla · descuidar el canal técnico y compensarlo con esfuerzo verbal · preparar el qué y no preparar el cómo · escuchar en modo espera, armando la respuesta en vez de recibir.' },
            { type: 'dominio', text: 'Listá los cuatro canales por los que estás emitiendo ahora mismo y decí qué está transportando cada uno en este momento concreto. Después conectate a una videollamada de prueba, grabate en silencio durante dos minutos escuchando, y mirá qué emitiste sin decir una palabra.' },
          ],
        },
        {
          id: 'c05',
          number: '05',
          title: 'La sintonía',
          subtitle: 'La condición para que el mensaje llegue',
          body: (
            <div className="space-y-4">
              <P>Que haya un canal abierto no garantiza que el mensaje llegue. Hace falta además que las dos partes estén operando en el mismo registro. La analogía: si uno transmite en una frecuencia y el otro tiene el dial en otra, hay emisión, hay canal, hay receptor encendido, y no hay recepción.</P>
              <H>Los cuatro ajustes concretos</H>
              <Row label="Vocabulario" value="Usar sus palabras, no las tuyas ni las de tu industria. Si dice «estancado», la palabra es «estancado». Si vos lo traducís a «meseta», acabás de comunicarle que interpretaste en lugar de escuchar." />
              <Row label="Ritmo" value="La velocidad a la que la persona piensa y habla. Ir más rápido produce sensación de apuro; ir mucho más lento produce impaciencia. Se iguala y después se conduce." />
              <Row label="Nivel de abstracción" value="Hay personas que hablan en conceptos y personas que hablan en ejemplos concretos. Contestar un concepto con un ejemplo produce la sensación de no haber sido entendido." />
              <Row label="Registro emocional" value="Alguien que baja la voz para contar algo que le cuesta no necesita una respuesta enérgica. La energía tiene que acompañar, no atropellar." />
              <Quote>Cuando alguien escucha su propia frase de vuelta, sabe que lo entendiste. Cuando escucha tu sinónimo, sabe que lo interpretaste.</Quote>
              <H>Señales de sintonía lograda</H>
              <Ul>
                <Li>La persona se explaya sin que se lo pedís.</Li>
                <Li>Aparecen silencios cómodos, sin necesidad de llenarlos.</Li>
                <Li>Te corrige o te amplía cuando devolvés algo. Corregir es señal de que está adentro.</Li>
                <Li>Empieza a usar tus palabras, o vos empezás a usar las suyas sin pensarlo.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Usar jerga técnica o de industria para sonar profesional · traducir las palabras del prospecto a las propias · ir más rápido que la persona porque uno ya sabe a dónde va · responder con energía alta a alguien que acaba de bajar el tono.' },
            { type: 'dominio', text: 'Repetí, textualmente, tres palabras exactas que usó tu último prospecto para describir su problema o lo que sentía. Si no las tenés, no estabas sintonizado: estabas esperando tu turno.' },
          ],
        },
        {
          id: 'c06',
          number: '06',
          title: 'Lo que transmitís antes de hablar',
          subtitle: 'La emisión involuntaria',
          body: (
            <div className="space-y-4">
              <P>No se puede no comunicar. Aunque no digas nada, estás emitiendo: la ropa, el encuadre, la luz, el fondo, la postura, el gesto, la quietud. Todo eso llega antes que la primera palabra y no se puede desactivar. La única decisión disponible es si esa emisión la controlás o la dejás librada al azar.</P>
              <H>El inventario de emisión</H>
              <Row label="Encuadre y cámara" value="La cámara por debajo de los ojos obliga a mirar hacia abajo y se lee como inseguridad. A la altura de los ojos produce una conversación entre pares." />
              <Row label="Luz" value="Una cara que se ve con claridad genera confianza; una cara en sombra o a contraluz genera desconfianza sin que nadie sepa explicar por qué." />
              <Row label="Fondo" value="Orden, contexto y cuidado. Comunica cuánta importancia le diste a esta conversación antes de que empezara." />
              <Row label="Ropa" value="El nivel de formalidad al que estás jugando. No hay una regla universal: hay coherencia con el interlocutor y con lo que estás ofreciendo." />
              <Row label="Postura" value="Energía disponible. El cuerpo hundido comunica cansancio incluso cuando la voz suena bien." />
              <Row label="Gesto y quietud" value="Estado interno. El movimiento nervioso, el desvío de mirada hacia otra pantalla, la cara tensa: todo eso se lee." />
              <H>La congruencia manda sobre el contenido</H>
              <P>Cuando dos canales dicen cosas distintas, gana el canal no verbal. Un argumento impecable con audio entrecortado se percibe como un mensaje entrecortado. Un diagnóstico brillante dicho a contraluz, con la cara en sombra, se percibe con la desconfianza que produce no poder ver una cara.</P>
              <P>En una llamada pasa idéntico. Una persona que aparece impecable y después habla con inseguridad pierde más que si hubiera aparecido normal. Y al revés: alguien que atiende en pijama, tirado en la silla, no vende nada aunque su argumento sea correcto, porque la primera hipótesis ya se formó y todo lo que venga después se lee a través de ella.</P>
              <Quote>Cuidar la emisión inicial no es superficialidad: es administrar la variable que gobierna todo lo que viene después.</Quote>
              <H>El espejo</H>
              <P>La emisión propia no se puede evaluar desde adentro. Hace falta una devolución externa, y el mecanismo más simple es mirarse: un espejo antes de salir, el vidrio de una vitrina al pasar, la ventana de la cámara antes de conectarse. La pregunta es siempre la misma: ¿qué información estoy transmitiendo ahora mismo? Si lo que ves no es lo que querés transmitir, todavía estás a tiempo de cambiarlo. Después de conectarte, no.</P>
              <P>La versión profesional de este mecanismo es la revisión de llamadas grabadas. Ahí se ve exactamente lo mismo, con más detalle y sin posibilidad de discusión. Casi siempre el propio operador identifica sus errores antes que cualquier supervisor: la dificultad no es verlos, es querer verlos.</P>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Creer que «lo importante es lo que digo» · ponerse una sonrisa sin tener el estado que la sostenga · descuidar la emisión mientras se escucha · no revisar nunca una grabación propia · revisarla y buscar excusas en lugar de correcciones.' },
            { type: 'dominio', text: 'Hacé el inventario completo de tu propio encuadre —los seis elementos— y escribí al lado de cada uno qué está comunicando hoy. Corregí los que no comuniquen lo que querés. Después mirá una grabación propia sin sonido durante dos minutos y anotá qué le está pasando a esa persona en pantalla.' },
          ],
        },
      ],
    },
    {
      id: 'bloque03',
      label: 'Bloque 03',
      short: 'La percepción',
      icon: <Eye className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'c07',
          number: '07',
          title: 'Información y percepción',
          subtitle: 'El dato es común, la realidad es individual',
          body: (
            <div className="space-y-4">
              <P>La mayor parte de los desacuerdos, las objeciones inesperadas y las llamadas que se enfrían sin motivo aparente vienen de acá: dos personas creyendo que están hablando de lo mismo cuando en realidad están hablando de dos construcciones distintas del mismo hecho.</P>
              <H>La cadena de procesamiento</H>
              <Row label="01 · Estímulo" value="Algo ocurre. Es común a todos los presentes." />
              <Row label="02 · Recepción" value="Entra por los sentidos. Puede haber pérdida: no todos registran lo mismo." />
              <Row label="03 · Procesamiento" value="Pasa por los filtros: creencias, experiencias, valores, estado del momento." />
              <Row label="04 · Interpretación" value="Se le asigna un significado, y ese significado se siente como si fuera el hecho." />
              <Row label="05 · Realidad" value="A partir de acá la persona actúa sobre su interpretación, no sobre el estímulo." />
              <Quote>La interpretación no se siente como una interpretación. Se siente como un hecho.</Quote>
              <H>La consecuencia central</H>
              <P>El dato es común. La realidad es individual. Cuando un prospecto describe su situación, no te está entregando los hechos: te está entregando su construcción de los hechos. Tu trabajo no es corregir esa construcción. Es entenderla lo suficiente como para saber de dónde salió.</P>
              <H>Qué observar</H>
              <Ul>
                <Li>Las palabras de valoración: &ldquo;es imposible&rdquo;, &ldquo;no funciona&rdquo;, &ldquo;siempre pasa lo mismo&rdquo;. Son interpretaciones presentadas como hechos.</Li>
                <Li>Qué elementos del panorama la persona no menciona. Lo que no registró dice tanto como lo que describe.</Li>
                <Li>Tus propias valoraciones internas durante la llamada. &ldquo;Este no compra&rdquo; también es una interpretación.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Tratar la propia lectura como si fuera el hecho · discutir la percepción del prospecto en lugar de entenderla · corregir su interpretación antes de haber entendido de dónde viene.' },
            { type: 'dominio', text: 'Tomá una frase real que te dijo un prospecto y separala en dos columnas: qué parte es dato verificable y qué parte es interpretación suya. Después hacé lo mismo con una conclusión que sacaste vos durante esa llamada.' },
          ],
        },
        {
          id: 'c08',
          number: '08',
          title: 'Los filtros',
          subtitle: 'Lo que hay entre el dato y la interpretación',
          body: (
            <div className="space-y-4">
              <P>Sin esto, &ldquo;cada uno ve las cosas distinto&rdquo; queda como una frase de sentido común. Con esto, se convierte en algo que se puede investigar durante una conversación.</P>
              <H>De qué está hecho el filtro</H>
              <Row label="Creencias" value="Lo que la persona da por cierto sin cuestionarlo. Suelen ser conclusiones sacadas de una experiencia puntual y generalizadas después: «probé algo así y no funcionó» hoy es una regla que le cierra opciones." />
              <Row label="Valores y principios" value="Qué considera importante, qué considera correcto, qué está dispuesta a resignar y qué no. Determina qué propuestas son siquiera considerables." />
              <Row label="Experiencias previas" value="Lo que ya vivió con problemas parecidos, con proveedores parecidos. Define qué le vas a poder proponer y qué no." />
              <Row label="Entorno de origen" value="Familia, cultura, contexto en el que se formó. Es el filtro más profundo y el menos visible, porque lo que viene de ahí no se percibe como una posición: se percibe como lo normal." />
              <Row label="Estado del momento" value="El único filtro que cambia rápido. La misma persona, con la misma historia, procesa distinto un lunes tranquilo que un jueves después de una mala noticia." />
              <Quote>En cada llamada hay dos filtros operando, no uno. El del prospecto y el tuyo.</Quote>
              <H>Qué observar</H>
              <Ul>
                <Li>Frases con siempre, nunca, todos, ninguno. Casi siempre marcan una creencia generalizada a partir de un caso.</Li>
                <Li>Explicaciones que apuntan hacia afuera: el mercado, la crisis, la competencia, la suerte.</Li>
                <Li>Qué opciones descarta sin evaluarlas. Ahí hay una experiencia previa que todavía no contó.</Li>
                <Li>Tus propios descartes rápidos. Si un tipo de prospecto te parece automáticamente poco serio, eso es un filtro tuyo.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Juzgar el filtro del prospecto en lugar de mapearlo · asumir que comparten filtros porque comparten industria o edad · discutir una creencia antes de saber de qué experiencia salió.' },
            { type: 'dominio', text: 'Nombrá un filtro propio que te haga descartar o subestimar prospectos antes de tiempo, y decí de qué experiencia salió. Después identificá, en tu última conversación comercial, una creencia del prospecto y la experiencia concreta de la que nació.' },
          ],
        },
        {
          id: 'c09',
          number: '09',
          title: 'Preguntar en vez de asumir',
          subtitle: 'La consecuencia operativa',
          body: (
            <div className="space-y-4">
              <P>&ldquo;No asumas&rdquo; es la indicación más repetida de la formación en ventas y la menos cumplida, porque se enseña como una prohibición sin mecanismo. Con los conceptos 07 y 08 instalados, deja de ser una regla: si la realidad del otro se construye con filtros que no conocés, entonces cualquier cosa que completes por tu cuenta la vas a completar mal.</P>
              <H>Cómo se detecta una suposición</H>
              <P>Hay una prueba única y funciona siempre: ¿podés señalar la frase exacta de la que salió? Si podés, es un dato. Si no podés, es una suposición tuya, por más razonable que suene.</P>
              <Quote>Preguntar de más cuesta quince segundos y comunica interés. Asumir mal cuesta la conversación entera.</Quote>
              <H>Las tres formas de asumir</H>
              <Row label="Completar" value="Terminar la frase del otro, aunque sea con la intención de mostrar que se lo entendió. Se pierde el final que la persona iba a decir, que casi nunca es el que vos ibas a poner." />
              <Row label="Traducir" value="Devolver lo que dijo con tus palabras. Cambia el significado aunque parezca lo mismo, y le comunica que interpretaste en vez de escuchar." />
              <Row label="Extrapolar" value="Deducir un dato que no dio a partir de uno que sí dio. «Si dice que factura poco, entonces no tiene presupuesto.» Ninguna de las dos cosas se sigue de la otra." />
              <H>La disciplina, en concreto</H>
              <Ul>
                <Li>Antes de afirmar, rastreá. Si no podés nombrar de dónde salió, no lo digas: preguntalo.</Li>
                <Li>Confirmá lo que ya creés saber. Especialmente lo que creés saber.</Li>
                <Li>Devolvé con sus palabras. Es la única forma de verificar sin interpretar.</Li>
                <Li>Sostené el silencio. La mayoría de las suposiciones se dicen para no dejar un hueco.</Li>
                <Li>Contá tus suposiciones al revisar. Es una métrica que baja con el entrenamiento.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Completar la frase del otro · usar sinónimos al devolver · deducir presupuesto, urgencia o capacidad a partir de un dato suelto · aplicar la experiencia de un caso anterior como si fuera información de este.' },
            { type: 'dominio', text: 'Señalá tres suposiciones de tu última conversación comercial y escribí, para cada una, la pregunta concreta que las habría verificado.' },
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
          id: 'c10',
          number: '10',
          title: 'Los primeros segundos',
          subtitle: 'Lo que se decide antes de la primera palabra',
          body: (
            <div className="space-y-4">
              <P>Jordan Belfort sostiene que la llamada se define en los primeros segundos. Con los conceptos anteriores instalados, deja de ser un dato curioso y pasa a ser deducible: si la emisión visual y contextual llega antes que la verbal, y si el receptor procesa esa información con sus filtros para armar una hipótesis, entonces la hipótesis sobre quién sos ya está formada cuando abrís la boca.</P>
              <H>El escaneo</H>
              <P>Cuando dos personas que no se conocen se encuentran, lo primero no es un intercambio de palabras: es un relevamiento completo. Cara, ropa, postura, entorno, ruido — todo. Ese relevamiento no se decide y no se puede apagar. Y no responde primero a &ldquo;¿quién es esta persona?&rdquo;, sino a una anterior: ¿esto es seguro?</P>
              <Quote>En los primeros segundos no se gana la venta: se pierde. Nadie decide comprar en cuatro segundos, pero mucha gente decide en cuatro segundos no abrirse.</Quote>
              <H>Los sesenta segundos previos</H>
              <Row label="1. Revisión técnica" value="Audio, cámara, luz, conexión. Antes, no cuando ya entró la persona." />
              <Row label="2. Revisión de encuadre" value="El inventario del concepto 06, mirando la propia ventana de cámara." />
              <Row label="3. Reseteo de estado" value="El protocolo del concepto 11. Es el paso que más se saltea y el que más pesa." />
              <Row label="4. Repaso del propósito" value="Qué necesitás entender en esta conversación. No qué querés vender." />
              <Row label="5. Chequeo de interés propio" value="Diez segundos: ¿estoy interesado en resolverle el problema a esta persona, o estoy interesado en cerrar?" />
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Improvisar la apertura · conectarse en el minuto exacto, sin margen para preparar nada · arrastrar el estado de la llamada anterior · creer que un mal comienzo se recupera con buenos argumentos · compensar el nerviosismo con exceso de energía.' },
            { type: 'dominio', text: 'Escribí tu protocolo de los sesenta segundos previos y ejecutalo igual en cinco llamadas seguidas. Después contestá: ¿podés describir, sin mirarlo, qué evalúa un prospecto tuyo en los primeros segundos, en orden?' },
          ],
        },
        {
          id: 'c11',
          number: '11',
          title: 'Control del estado',
          subtitle: 'Del estímulo al resultado',
          body: (
            <div className="space-y-4">
              <P>El estado es parte del mensaje. El concepto 06 estableció que se emite todo el tiempo; el estado interno es justamente lo que gobierna esa emisión involuntaria. Un operador que no puede administrar su propio estado tiene una variable central de su trabajo librada a lo que le haya pasado esa mañana.</P>
              <H>La cadena</H>
              <Row label="Estímulo" value="Entra información del entorno." />
              <Row label="Pensamiento" value="El procesamiento le asigna un significado. Único punto de intervención real." />
              <Row label="Emoción" value="El significado produce una respuesta emocional." />
              <Row label="Acción" value="La emoción impulsa —o frena— una conducta." />
              <Row label="Resultado" value="La conducta produce una consecuencia." />
              <H>El protocolo de reseteo</H>
              <Row label="Parte física" value="Cambiar la configuración del cuerpo: moverse, respirar de manera deliberada, soltar los hombros, movilizar la cara. Un gesto amplio de cara interrumpe la expresión acumulada." />
              <Row label="Parte cognitiva" value="Cambiar el foco de atención: nombrar lo que pasó, dejarlo afuera de esta hora concreta y traer el propósito de la conversación que viene. No es negar lo que pasó: es aplazarlo." />
              <Quote>Controlar el estado no es no sentir. Es poder sostener un compromiso ya asumido sin descargarlo sobre alguien que no tiene nada que ver.</Quote>
              <P>Hay un límite de criterio que conviene tener escrito de antemano: cuando lo que pasó excede lo que un reseteo puede manejar, la decisión correcta es reprogramar. Reprogramar una llamada es una decisión profesional, no una falla.</P>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Confundir control con represión · entrar a una llamada con el estado de lo que acaba de pasar · sobreactuar entusiasmo para tapar el estado real · no tener un protocolo y depender de tener un buen día.' },
            { type: 'dominio', text: 'Escribí tu protocolo de reseteo —parte física y parte cognitiva— en menos de dos minutos de ejecución, y probalo bajo presión real. Después identificá una llamada concreta en la que tu estado previo afectó el resultado.' },
          ],
        },
        {
          id: 'c12',
          number: '12',
          title: 'El marco del solucionador de problemas',
          subtitle: 'La ética como estructura',
          body: (
            <div className="space-y-4">
              <P>Todo lo anterior aumenta la capacidad de influir sobre otra persona. Entender cómo se construye una percepción, cómo viaja la información, qué mueve a alguien es, literalmente, entender cómo hacer que alguien sienta determinadas cosas. Por eso la ética no puede ser una advertencia al final: una advertencia no es un criterio. Lo que sirve es una estructura con criterios aplicables.</P>
              <H>Diagnóstico o manipulación</H>
              <Quote>La pregunta que separa las dos cosas es una sola: ¿quién definió el resultado deseado?</Quote>
              <P>Si el resultado lo definió la persona —quiere resolver algo, y vos la acompañás a ver cómo—, es diagnóstico. Si el resultado lo definiste vos y estás construyendo el camino para que ella llegue ahí, es manipulación.</P>
              <H>Los tres filtros antes de avanzar</H>
              <Row label="1. ¿El problema existe?" value="No el síntoma: el problema. Y no según tu experiencia con casos parecidos, sino según lo que esta persona efectivamente describió." />
              <Row label="2. ¿Lo que ofrezco lo resuelve?" value="Con honestidad sobre el alcance. Resolver parcialmente y decirlo es legítimo; dejar creer que se resuelve todo, no." />
              <Row label="3. ¿Puede sostener el proceso?" value="Tiempo, contexto, recursos, momento. Vender un proceso que la persona no va a poder atravesar es venderle una frustración con anticipo." />
              <H>El &ldquo;no&rdquo; es un resultado válido</H>
              <P>Una venta mal diagnosticada produce alguien que paga, no obtiene resultado, pide reembolso, no vuelve y cuenta la experiencia. El daño empieza en la persona que confió y termina en la reputación de quien vendió. Ninguna comisión cubre esa cuenta.</P>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Tratar la ética como disclaimer y no como criterio · fabricar urgencia que el diagnóstico no encontró · avanzar con dos de los tres filtros cumplidos · usar la vulnerabilidad como palanca · justificar una venta dudosa con «el producto es bueno, después lo va a agradecer».' },
            { type: 'dominio', text: 'Describí un caso concreto en el que dijiste que no a una venta que podías cerrar, y por qué. Si no tenés ninguno, es un dato en sí mismo.' },
          ],
        },
      ],
    },
    {
      id: 'cierre',
      label: 'Cierre',
      short: 'Cierre',
      icon: <Brain className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'reglas',
          title: 'Reglas transversales',
          subtitle: 'Lo que funciona en todos los bloques a la vez',
          body: (
            <div className="space-y-4">
              <P>Estas siete reglas no pertenecen a ningún concepto en particular: funcionan en todos al mismo tiempo. Son las que marcan la diferencia entre alguien que leyó el manual y alguien que opera con él.</P>
              <div className="space-y-3">
                {[
                  { n: '1', t: 'No se puede no comunicar', d: 'Aunque no digas nada, estás emitiendo. La única decisión disponible es si esa emisión la controlás o la dejás librada al azar.' },
                  { n: '2', t: 'El dato es común, la realidad es individual', d: 'Lo que el prospecto describe no son los hechos: es su construcción de los hechos. Y lo mismo aplica a tus propias lecturas.' },
                  { n: '3', t: 'Nada es dato hasta que la persona lo confirma', d: '¿Podés señalar la frase exacta de la que salió? Si no podés, es una hipótesis tuya.' },
                  { n: '4', t: 'El terreno común se mantiene, no se hace', d: 'No es una etapa inicial que se completa y se archiva. Es una condición permanente.' },
                  { n: '5', t: 'Tu estado es parte del mensaje', d: 'El estado interno gobierna la emisión involuntaria. Es una variable operativa del trabajo, y por eso tiene protocolo.' },
                  { n: '6', t: 'La congruencia manda sobre el contenido', d: 'Cuando dos canales dicen cosas distintas, gana el no verbal. Si no lo sentís, no lo digas.' },
                  { n: '7', t: 'El "no" es un resultado válido', d: 'Si el diagnóstico muestra que no podés ayudar a esa persona, decirlo es parte del trabajo, no una falla.' },
                ].map(r => (
                  <div key={r.n} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                    <span className="text-brand-gold font-black text-lg w-5 shrink-0">{r.n}</span>
                    <div>
                      <p className="text-brand-text font-semibold text-sm mb-1">{r.t}</p>
                      <p className="text-brand-muted text-sm leading-relaxed">{r.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          id: 'tablero',
          title: 'Tablero de dominio',
          subtitle: 'Criterio de verificación concepto por concepto',
          body: (
            <div className="space-y-2">
              <P>Una prueba por concepto. No es una pregunta de comprensión: es una demostración. Si no podés superarla con un ejemplo propio y concreto, el concepto está leído pero no instalado.</P>
              {[
                { c: '01 · La conversación', p: 'Explicar sin la palabra "conversación" qué diferencia una llamada de una charla, y señalar en una grabación propia dónde dejaste de conversar.' },
                { c: '02 · Punto en común', p: 'Nombrar el terreno común de tus últimas tres llamadas, en qué segundo apareció y quién lo introdujo.' },
                { c: '03 · El interés', p: 'Listar tres hechos —no declaraciones— que prueben el interés real de tu último prospecto.' },
                { c: '04 · Emisor y receptor', p: 'Enumerar los cuatro canales por los que estás emitiendo y qué transporta cada uno ahora mismo.' },
                { c: '05 · La sintonía', p: 'Repetir textualmente tres palabras exactas que usó tu último prospecto.' },
                { c: '06 · Emisión involuntaria', p: 'Hacer el inventario completo de tu encuadre y decir qué comunica cada elemento hoy.' },
                { c: '07 · Percepción', p: 'Separar, en una frase real de un prospecto, qué parte es dato y qué parte es interpretación.' },
                { c: '08 · Los filtros', p: 'Nombrar un filtro propio que te haga descartar prospectos, y de qué experiencia salió.' },
                { c: '09 · No asumir', p: 'Señalar tres suposiciones de tu última llamada y la pregunta que las habría verificado.' },
                { c: '10 · Primeros segundos', p: 'Tener escrito un protocolo de sesenta segundos previos y haberlo ejecutado igual cinco veces.' },
                { c: '11 · Control del estado', p: 'Tener un protocolo de reseteo de menos de dos minutos y haberlo probado bajo presión real.' },
                { c: '12 · El marco', p: 'Describir un caso concreto en el que dijiste que no a una venta que podías cerrar.' },
              ].map(r => <Row key={r.c} label={r.c} value={r.p} />)}
            </div>
          ),
        },
        {
          id: 'errores',
          title: 'Errores que rompen la conversación',
          subtitle: 'No son errores de estilo — rompen el entorno donde se ejecuta todo',
          body: (
            <div className="space-y-2">
              {[
                { e: 'Ejecutar el orden de la lista y no el de la conversación', q: 'Se administra en lugar de conversar. Las respuestas se acortan y la información deja de fluir.' },
                { e: 'Poner el terreno común del lado de la solución', q: 'La persona no está ahí. Sigue contestando por cortesía mientras busca una salida.' },
                { e: 'Fabricar interés que el diagnóstico no encontró', q: 'Convierte una compra en una compra por miedo, con reembolso y desgaste garantizados.' },
                { e: 'Descuidar el canal técnico o el ambiental', q: 'El mensaje pesa menos aunque el contenido sea correcto. Nadie lo dice en voz alta.' },
                { e: 'Traducir las palabras del prospecto a las propias', q: 'Comunica interpretación en lugar de escucha. La persona deja de ampliar.' },
                { e: 'Emitir descuidadamente mientras se escucha', q: 'Se contradice todo lo construido, justo en el momento en que el otro está diciendo lo importante.' },
                { e: 'Tratar la propia lectura como si fuera un hecho', q: 'Se construye el diagnóstico sobre una interpretación. Todo lo que sigue hereda el error.' },
                { e: 'Completar la frase del otro', q: 'Se pierde el final que iba a decir, que casi nunca es el que uno pone.' },
                { e: 'Extrapolar presupuesto, urgencia o capacidad', q: 'Se descartan personas que sí podían, por una deducción que no se sigue del dato.' },
                { e: 'Improvisar la apertura', q: 'Se juega la variable que gobierna toda la apertura sin haberla preparado.' },
                { e: 'Entrar con el estado del estímulo anterior', q: 'El prospecto recibe algo que no tiene nada que ver con él y responde a eso.' },
                { e: 'Sobreactuar entusiasmo', q: 'Produce incongruencia. La persona se pone en guardia sin saber por qué.' },
                { e: 'Usar la vulnerabilidad como palanca', q: 'Deja de ser diagnóstico. Es presión sobre alguien en un momento débil.' },
              ].map(r => (
                <div key={r.e} className="flex gap-3 rounded-xl border border-red-800/20 bg-red-950/10 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm mb-0.5">{r.e}</p>
                    <p className="text-brand-muted text-xs leading-relaxed">{r.q}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'puente',
          title: 'Hacia dónde va esto',
          subtitle: 'Puente al Manual 02 — cada concepto de este manual sostiene una afirmación del siguiente',
          body: (
            <div className="space-y-4">
              <P>Este manual instala los fundamentos. El siguiente instala la estructura del diagnóstico. Cada afirmación del Manual 02 se apoya en un concepto de este, y esa correspondencia es lo que hace que la estructura se entienda en lugar de memorizarse.</P>
              <div className="space-y-2">
                <Row label="«La conexión no se hace: se mantiene»" value="02 · El terreno común es una condición permanente, no una etapa inicial." />
                <Row label="«La conexión genuina es reducción de amenaza»" value="10 · El escaneo inicial resuelve primero la pregunta de seguridad, y recién después libera atención." />
                <Row label="«La curiosidad es consecuencia del interés»" value="03 · El interés es el motor; sin él la pregunta siguiente no se encadena con la respuesta anterior." />
                <Row label="«La certeza no se actúa: se transmite»" value="06 · La congruencia manda sobre el contenido. Lo actuado se lee como incongruencia." />
                <Row label="Principio de trazabilidad: ninguna conclusión sin origen" value="07, 08 y 09 · La realidad ajena se construye con filtros que no conocés; completarla por cuenta propia es completarla mal." />
                <Row label="«Anotar las palabras exactas, no los sinónimos»" value="05 · Sintonía de vocabulario: escuchar la propia frase de vuelta comunica comprensión; el sinónimo comunica interpretación." />
                <Row label="«Confirmar aunque ya lo sepas»" value="09 · El costo asimétrico: preguntar de más cuesta segundos, asumir mal cuesta la conversación." />
                <Row label="«Escuchar más de lo que hablamos» como dato medible" value="01 y 04 · Quien llena los silencios perdió el terreno; y mientras escuchás seguís emitiendo." />
                <Row label="«Las creencias son conclusiones de una mala experiencia»" value="08 · Los filtros y su origen concreto." />
                <Row label="Etapa 5: la línea que no se cruza" value="12 · Comprender es preguntar una vez; escarbar es presionar. Un diagnóstico honesto no necesita apretar." />
                <Row label="«El «no» es un resultado válido»" value="12 · Los tres filtros previos: si falta uno, no se avanza." />
              </div>
              <H>Lo que sigue</H>
              <P>Manual 02 · Estructura de Cualificación Comercial. Los dos pilares, las ocho etapas y los criterios de avance de una conversación consultiva. Sobre esa estructura se entrena después la ejecución: formulación de preguntas abiertas, guiadas y cerradas, manejo del hilo conversacional, detección de palabras clave, tonalidad, construcción de la oferta y de la presentación.</P>
              <Quote>Primero se entiende por qué. Después se entiende el mapa. Después se aprende a caminarlo.</Quote>
            </div>
          ),
        },
        {
          id: 'final',
          title: 'Principio Final',
          body: (
            <div className="space-y-6">
              <div className="rounded-2xl border border-brand-gold/25 bg-gradient-to-br from-[#0a1428] to-[#050d1e] p-8 text-center">
                <p className="text-xl md:text-2xl font-bold text-brand-text leading-relaxed max-w-2xl mx-auto">
                  Nadie compra un producto ni contrata un servicio: las personas quieren que les resuelvan un problema. Y nadie puede resolver un problema que no comprendió, ni comprender a alguien sin entender antes cómo esa persona construye su realidad.
                </p>
                <p className="text-brand-muted mt-4 text-sm">Todo lo demás —la estructura, las preguntas, la propuesta— es consecuencia de haber entendido esto primero.</p>
                <p className="text-brand-gold text-xs uppercase tracking-widest mt-6">Areté Fuera de Serie · Equipos de venta de alto rendimiento</p>
              </div>
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
  subtitle: 'Los dos pilares, las ocho etapas y los criterios de avance de una conversación consultiva',
  description: 'Esto es una estructura de pensamiento, no un guion. Lo que hay que dominar es el para qué de cada etapa: qué se busca comprender, en qué orden, y cómo saber que ya se comprendió.',
  chapters: [
    {
      id: 'apertura',
      label: 'Apertura',
      short: 'Apertura',
      icon: <BookOpen className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'uso',
          title: 'Cómo se usa este manual',
          body: (
            <div className="space-y-4">
              <P>Esto es una estructura de pensamiento, no un guion. Nadie tiene que repetir estas preguntas tal como están escritas. Lo que hay que dominar es el para qué de cada etapa: qué se busca comprender, en qué orden, y cómo saber que ya se comprendió.</P>
              <P>Un guion se memoriza y se recita. Una estructura se entiende y se aplica con criterio propio. La diferencia se nota enseguida: quien recita hace la pregunta que sigue en la lista; quien entiende hace la pregunta que sigue a la respuesta anterior.</P>
              <P>Por eso el manual está organizado en tres bloques. Primero el principio fundamental, que explica por qué la venta es una consecuencia y no un objetivo. Después los dos pilares, que son condiciones permanentes: sostienen la conversación de principio a fin. Y finalmente las ocho etapas, que sí avanzan en orden porque cada una necesita el material que produjo la anterior.</P>
              <H>Regla de lectura</H>
              <P>Cada etapa cierra con un criterio de avance: una pregunta de control que hay que poder responder antes de pasar a la siguiente. Si no la podés responder con las palabras del prospecto, la etapa no está terminada, por más que la conversación haya seguido de largo.</P>
              <H>Lo que este manual cubre y lo que no</H>
              <P>Acá está la estructura: el esqueleto del diagnóstico. Cómo formular cada pregunta —preguntas abiertas, guiadas y cerradas—, cómo sostener el hilo conversacional sin perderse, cómo detectar palabras clave, cómo trabajar la tonalidad, cómo construir la oferta y la presentación: todo eso se entrena aparte, sobre esta base. Primero la estructura. Después la ejecución.</P>
              <H>El mapa completo</H>
              <div className="space-y-2">
                <Row label="01 · Interés" value="El destino: a dónde quiere llegar." />
                <Row label="02 · Situación actual" value="El punto de partida: dónde está hoy." />
                <Row label="03 · Síntomas" value="Lo que se ve de la distancia entre ambos." />
                <Row label="04 · Problema real" value="Por qué existe esa distancia." />
                <Row label="05 · Impacto emocional" value="Cuánto le cuesta sostenerla." />
                <Row label="06 · Acompañamiento" value="Devolución emocional: te entendí." />
                <Row label="07 · Lógica" value="Devolución racional: esto es lo que está pasando." />
                <Row label="08 · Valor" value="El camino que resuelve exactamente eso." />
              </div>
              <P>Hay un punto de giro en el medio. En las etapas 1 a 5 recibimos: escuchamos, preguntamos, retenemos. En las etapas 6 a 8 devolvemos: mostramos lo que entendimos, lo ordenamos y proponemos. Todo lo que devolvemos en la segunda mitad tiene que haber entrado en la primera. No hay forma de devolver lo que nunca nos dieron.</P>
            </div>
          ),
        },
      ],
    },
    {
      id: 'principio',
      label: 'Principio',
      short: 'Principio',
      icon: <BookOpen className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'pf',
          title: 'Principio fundamental',
          subtitle: 'Por qué la venta es consecuencia de un buen diagnóstico',
          body: (
            <div className="space-y-4">
              <Quote>El objetivo de una cualificación no es vender. Es comprender profundamente a la persona para descubrir si realmente podemos ayudarla.</Quote>
              <H>Tres consecuencias duras</H>
              <P><span className="text-brand-text font-semibold">Primera:</span> la conversación puede terminar en un no. Como el objetivo es comprender, el &ldquo;no&rdquo; es un resultado válido del diagnóstico. Un solucionador de problemas que nunca dice que no, no está diagnosticando: está colocando.</P>
              <P><span className="text-brand-text font-semibold">Segunda:</span> el producto no es el centro. A nadie le importa el producto ni el servicio. Las personas quieren que les resuelvan un problema. Por eso la conversación gira alrededor del problema.</P>
              <P><span className="text-brand-text font-semibold">Tercera:</span> hay que conocer por dentro lo que se ofrece. Para que alguien avance tienen que darse tres confianzas al mismo tiempo: en la persona, en la empresa, y en el producto. Si falla una sola de las tres, no hay estructura que lo compense.</P>
              <H>La analogía médica</H>
              <P>Funciona igual que en medicina. Un paciente llega y dice que tiene fiebre y vómitos. Eso no es un diagnóstico: es lo que se ve. Ningún médico serio receta con esa información. &ldquo;Me faltan clientes&rdquo; es fiebre. &ldquo;Tengo baja conversión&rdquo; es fiebre. Quien propone una solución sobre eso está recetando sin diagnosticar.</P>
              <H>El mapa de las ocho etapas</H>
              <Row label="01 · Interés" value="El destino: a dónde quiere llegar." />
              <Row label="02 · Situación actual" value="El punto de partida: dónde está hoy." />
              <Row label="03 · Síntomas" value="Lo que se ve de la distancia entre ambos." />
              <Row label="04 · Problema real" value="Por qué existe esa distancia." />
              <Row label="05 · Impacto emocional" value="Cuánto le cuesta sostenerla." />
              <Row label="06 · Acompañamiento" value="Devolución emocional: te entendí." />
              <Row label="07 · Lógica" value="Devolución racional: esto es lo que está pasando." />
              <Row label="08 · Valor" value="El camino que resuelve exactamente eso." />
              <Quote>Principio de trazabilidad: cada afirmación del diagnóstico tiene que poder rastrearse hasta una frase que dijo el prospecto.</Quote>
            </div>
          ),
        },
      ],
    },
    {
      id: 'pilares',
      label: 'Pilares',
      short: 'Pilares',
      icon: <Shield className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'pilar1',
          title: 'Pilar 1 · Conexión genuina',
          subtitle: 'La condición que sostiene toda la conversación',
          body: (
            <div className="space-y-4">
              <P>Antes de hacer preguntas, la persona debe sentir que está hablando con alguien que realmente quiere comprenderla y no simplemente venderle algo. Alguien que percibe que lo están procesando contesta corto, contesta lo que corresponde, contesta la versión ordenada de su vida. Alguien que se siente comprendido cuenta lo que realmente pasa.</P>
              <H>Los seis comportamientos</H>
              <Row label="1. Escuchar más de lo que hablamos" value="Escucha activa, no silencio educado. Si en una cualificación hablás más que el prospecto, no estás cualificando, estás presentando." />
              <Row label="2. No interrumpir" value="Interrumpir comunica una sola cosa: que lo que vos ibas a decir importa más. En esas ramas suele estar la información más valiosa, precisamente porque es la que no venía preparada." />
              <Row label="3. Mostrar curiosidad real" value="La curiosidad no se simula, es consecuencia del interés. Cuando hay interés genuino, las preguntas salen solas y encadenan con lo anterior." />
              <Row label="4. Validar lo que la persona expresa" value="Validar no es darle la razón sobre los hechos. Es reconocer que lo que siente tiene sentido dado su contexto. Se puede validar una emoción sin validar una conclusión equivocada." />
              <Row label="5. Preguntas desde el interés, no desde un guion" value="El guion se detecta rápido porque produce un efecto característico: la conversación no avanza, se administra." />
              <Row label="6. Generar espacio para que se abra" value="El criterio para saber si lo lograste es la extensión y la espontaneidad de lo que cuenta. Cuando alguien se siente seguro, se explaya y entrega contexto que nunca hubieras conseguido con una pregunta directa." />
              <Quote>La conexión genuina no es simpatía: es reducción de amenaza.</Quote>
              <H>Las puertas</H>
              <P><span className="text-brand-text font-semibold">Puerta cerrada:</span> se cambia de tema con naturalidad y sin marcarlo. No se pide disculpas, no se explica, no se insiste. Insistir donde el otro se incomodó genera confrontación y la conversación se pierde entera.</P>
              <P><span className="text-brand-text font-semibold">Puerta abierta:</span> cuando alguien te cuenta espontáneamente algo personal, te está invitando a pasar. Ahí se entra, se acompaña un momento con interés real, y después se vuelve al hilo.</P>
              <H>El bucle</H>
              <P>Lo que el prospecto dijo al principio se retoma más adelante, a propósito. Le demuestra que lo escuchaste y que retuviste, y devuelve la conversación al terreno que importa. Salís y volvés, pero no perdés el hilo.</P>
            </div>
          ),
        },
        {
          id: 'pilar2',
          title: 'Pilar 2 · Recolección inteligente de información',
          subtitle: 'Cada pregunta con un propósito',
          body: (
            <div className="space-y-4">
              <P>Cada pregunta tiene un propósito. No preguntamos por preguntar. La calidad de la venta dependerá directamente de la calidad de la información obtenida.</P>
              <H>Las cuatro preguntas previas a cada pregunta</H>
              <Row label="1. ¿Qué quiero descubrir?" value="Evita preguntar sin foco y llenar tiempo." />
              <Row label="2. ¿Para qué necesito descubrirlo?" value="Evita juntar datos que no sirven para nada." />
              <Row label="3. ¿Qué voy a hacer con esa información?" value="Evita que la respuesta se pierda sin usarse." />
              <Row label="4. ¿Cuál es mi siguiente movimiento?" value="Evita quedarse sin rumbo después de escuchar." />
              <H>Las nueve dimensiones a comprender</H>
              <Row label="Su contexto" value="El escenario en el que vive el problema: mercado, momento, entorno, quién más está involucrado." />
              <Row label="Su negocio" value="Cómo gana dinero hoy, de qué depende su facturación, qué parte del proceso maneja y qué parte no." />
              <Row label="Sus objetivos" value="El resultado que quiere alcanzar y, detrás de eso, para qué lo quiere." />
              <Row label="Sus dificultades" value="Qué le está costando concretamente y desde cuándo." />
              <Row label="Sus creencias" value="Lo que da por cierto sin cuestionarlo. Suelen ser conclusiones que sacó de una mala experiencia y hoy le limitan las opciones." />
              <Row label="Sus experiencias anteriores" value="Qué probó, con quién, cómo terminó. Define qué le vas a poder proponer y qué no." />
              <Row label="Su forma de decidir" value="Si decide solo o consulta, con quién, qué necesita para estar seguro, cuánto tarda." />
              <Row label="Sus prioridades" value="Qué está primero cuando no puede tener todo. Lo que resigna dice más que lo que pide." />
              <Row label="Su nivel de urgencia" value="Qué tan tolerable le resulta seguir como está. No se pregunta: se deduce de todo lo anterior." />
              <H>Tres hábitos que sostienen la recolección</H>
              <P><span className="text-brand-text font-semibold">Retener:</span> una sola respuesta larga puede contener material de cinco etapas distintas. Volver a preguntar algo que la persona ya contestó es la prueba más clara de que no estabas escuchando.</P>
              <P><span className="text-brand-text font-semibold">Confirmar aunque ya lo sepas:</span> un supuesto se convierte en dato solamente cuando la persona lo confirma con su propia boca.</P>
              <P><span className="text-brand-text font-semibold">Anotar las palabras exactas:</span> las palabras que la persona usa para describir su problema son material de trabajo. Se devuelven casi textuales en las etapas 6 y 7.</P>
            </div>
          ),
        },
      ],
    },
    {
      id: 'etapas1',
      label: 'Etapas 01–04',
      short: 'Etapas 1–4',
      icon: <Brain className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'e01',
          number: '01',
          title: 'Identificar el interés',
          subtitle: 'El destino',
          body: (
            <div className="space-y-4">
              <P>Sin destino declarado no hay contra qué medir nada. Todo lo que viene después —la situación actual, los síntomas, la causa— sólo tiene sentido en relación con un resultado que la persona quiere y no está consiguiendo.</P>
              <H>Preguntas guía</H>
              <Row label="¿Qué te llamó la atención para agendar esta reunión?" value="Busca el disparador, no el deseo. Qué pasó, y por qué ahora y no hace seis meses. La respuesta suele contener el primer síntoma sin que la persona se dé cuenta." />
              <Row label="¿Qué te gustaría lograr?" value="El objetivo declarado, en sus propios términos. Es la versión de superficie: casi nunca es la definitiva." />
              <Row label="¿Qué resultado esperás conseguir?" value="Lleva lo abstracto a lo concreto. «Mejorar» no es un resultado; «cerrar tres clientes por mes» sí lo es." />
              <Row label="Si todo saliera como querés, ¿cómo sería esa situación?" value="Obliga a describir el estado deseado en detalle. Ahí aparece el motivo real, que casi nunca es el número: es lo que ese número le permitiría hacer." />
              <H>Qué escuchar</H>
              <Ul>
                <Li>La diferencia entre lo que pide y lo que quiere. Suelen no coincidir.</Li>
                <Li>Si el objetivo tiene un número y un plazo, o si es una sensación.</Li>
                <Li>A quién menciona: pareja, socios, hijos, equipo. Ahí aparecen tanto el motivo como quien participa de la decisión.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Tomar la primera respuesta como definitiva · empezar a proponer apenas escuchás un objetivo que te resulta familiar · confundir el interés que trajo a la persona con lo que verdaderamente quiere cambiar.' },
            { type: 'dominio', text: '¿Podés enunciar el resultado que busca, con sus palabras, de modo que si se lo repetís él te diga que sí sin corregirte nada?' },
          ],
        },
        {
          id: 'e02',
          number: '02',
          title: 'Comprender la situación actual',
          subtitle: 'El punto de partida',
          body: (
            <div className="space-y-4">
              <P>El problema no se detecta en el vacío: se detecta en el contraste entre lo que la persona hace y lo que quiere conseguir. Sin conocer el punto de partida, cualquier causa que identifiques es una hipótesis prestada de otro caso.</P>
              <P>Esta etapa además protege de un error caro: proponer algo que la persona ya probó y le falló. Cuando eso pasa, no perdés la propuesta: perdés la autoridad.</P>
              <H>Preguntas guía</H>
              <Row label="¿Cómo están haciendo esto actualmente?" value="El proceso real, con nombres y pasos, no la versión ideal. Pedí el detalle operativo hasta poder reconstruirlo." />
              <Row label="¿Cómo vienen trabajando?" value="Historia y ritmo. Desde cuándo funciona así y qué cambió en el medio." />
              <Row label="¿Qué resultados están obteniendo?" value="La línea de base. Sin números no hay brecha medible, y sin brecha el diagnóstico se vuelve opinión." />
              <Row label="¿Qué intentaron anteriormente?" value="El mapa de intentos fallidos. Además revela creencias: «probamos X y no funcionó» es hoy una conclusión que le cierra opciones." />
              <Row label="¿Qué cosas sí funcionan y cuáles no?" value="Evita el diagnóstico total. Separa lo que hay que conservar de lo que hay que corregir." />
              <Quote>Acá buscamos contexto, no soluciones. Cualquier propuesta hecha en este punto es prematura por definición.</Quote>
              <H>Qué escuchar</H>
              <Ul>
                <Li>Procesos que en realidad no existen, aunque la persona crea que sí.</Li>
                <Li>Dependencias: de una sola persona, de un solo canal, de la recomendación.</Li>
                <Li>Ausencia de medición. Quien no mide no puede saber dónde se le cae el proceso.</Li>
                <Li>La distancia entre lo que dice que hace y lo que efectivamente hace.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: '¿Podrías describirle su proceso actual a alguien que no estuvo en la reunión, con suficiente detalle como para que entienda dónde se produce el resultado y dónde no?' },
          ],
        },
        {
          id: 'e03',
          number: '03',
          title: 'Detectar los síntomas',
          subtitle: 'Lo visible',
          body: (
            <div className="space-y-4">
              <P>El síntoma es lo único que el prospecto puede ver por sí mismo, y por eso es lo primero que va a decir. Es el punto de entrada al problema, no el problema. Todo lo que la persona viene haciendo hasta hoy está dirigido a los síntomas: por eso no le funcionó.</P>
              <H>Preguntas guía</H>
              <Row label="¿Qué es lo que más te está costando?" value="Abre con el síntoma que más pesa, que no siempre es el más grave." />
              <Row label="¿Dónde aparecen las mayores dificultades?" value="Ubica el síntoma en un punto concreto del proceso relevado en la etapa 2." />
              <Row label="¿Qué sentís que no está funcionando?" value="Deja que sea la persona quien señale, en lugar de señalar vos." />
              <Row label="¿Qué consecuencias ves todos los días?" value="Baja el problema del plano abstracto al plano cotidiano, que es donde realmente se sufre." />
              <H>Síntomas típicos</H>
              <p className="text-brand-muted text-sm leading-relaxed">Falta de clientes · baja conversión · desorganización · estrés operativo · poco tiempo · facturación inestable · equipo desmotivado.</p>
              <P>Ninguno de estos es un problema. Todos son efectos. &ldquo;Me faltan clientes&rdquo; es el resultado de algo; &ldquo;tengo baja conversión&rdquo; es el resultado de algo; &ldquo;estamos desorganizados&rdquo; es el resultado de algo. La etapa siguiente existe precisamente para encontrar ese algo.</P>
              <H>Qué escuchar</H>
              <Ul>
                <Li>Antigüedad: desde cuándo viene así. Un síntoma de tres meses y uno de tres años no son el mismo caso.</Li>
                <Li>Frecuencia: si es constante o aparece por temporadas.</Li>
                <Li>Jerarquía: cuál nombra primero y con más carga en la voz. Ese es el que le duele.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Quedarse acá y ofrecer una solución al síntoma · agregar síntomas que la persona no mencionó · pasar a la etapa 4 con un solo síntoma relevado.' },
            { type: 'dominio', text: '¿Tenés al menos tres efectos concretos, dichos por la persona, cada uno con un ejemplo o una referencia temporal?' },
          ],
        },
        {
          id: 'e04',
          number: '04',
          title: 'Encontrar el problema real',
          subtitle: 'La causa raíz',
          body: (
            <div className="space-y-4">
              <P>Es la etapa que define la calidad de todo el proceso. Si el diagnóstico se detiene en el síntoma, la solución también se va a detener ahí, y va a fracasar exactamente igual que todo lo que la persona ya intentó.</P>
              <H>El mecanismo: encadenar, no cambiar de tema</H>
              <P>No se pasa a otro asunto: se profundiza sobre la respuesta anterior. Cada respuesta contiene el material de la pregunta siguiente.</P>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-3">Ejemplo de encadenamiento</p>
                <p className="text-sm text-brand-muted">Síntoma: baja facturación.</p>
                <p className="text-sm text-brand-text">→ ¿Por qué creés que está sucediendo? <span className="text-brand-muted">Porque el equipo no está vendiendo.</span></p>
                <p className="text-sm text-brand-text">→ ¿Y qué está provocando eso? <span className="text-brand-muted">Los vendedores no se están capacitando.</span></p>
                <p className="text-sm text-brand-text">→ ¿Qué pasa cuando ocurre eso? <span className="text-brand-muted">No venden, se desaniman, se desmotivan más.</span></p>
                <p className="text-sm text-brand-text">→ ¿Qué consecuencias tiene a largo plazo? <span className="text-brand-muted">El proyecto no se sostiene.</span></p>
                <p className="text-xs text-brand-gold/70 mt-3 leading-relaxed">La causa terminó siendo un sistema de formación que no existe — no la facturación.</p>
              </div>
              <H>Cómo sabés que llegaste a la causa</H>
              <Ul>
                <Li>Cuando una sola explicación da cuenta de varios síntomas a la vez, no de uno solo.</Li>
                <Li>Cuando la respuesta deja de apuntar hacia afuera (el mercado, la crisis) y empieza a describir algo dentro del control de la persona.</Li>
                <Li>Cuando el propio prospecto dice algo del tipo &ldquo;nunca lo había pensado así&rdquo;.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: '¿Podés nombrar una sola causa que explique la mayoría de los síntomas relevados en la etapa 3, y señalar la frase exacta del prospecto de la que salió?' },
          ],
        },
      ],
    },
    {
      id: 'etapas2',
      label: 'Etapas 05–08',
      short: 'Etapas 5–8',
      icon: <MessageSquare className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'e05',
          number: '05',
          title: 'Comprender el impacto emocional',
          subtitle: 'El costo',
          body: (
            <div className="space-y-4">
              <P>Un problema explicado sólo en términos operativos no mueve a nadie. Todos convivimos durante años con problemas que sabemos que tenemos. Lo que convierte un problema conocido en un problema que se decide resolver es el costo que tiene sostenerlo. La emoción genera urgencia, y la urgencia no se fabrica: se descubre.</P>
              <Quote>Comprender es preguntar y aceptar la respuesta que llega. Dramatizar es amplificar lo que la persona no dijo. Un diagnóstico honesto no necesita apretar.</Quote>
              <H>Preguntas guía</H>
              <Row label="¿Cómo te hace sentir esta situación?" value="Abre el plano emocional sin sugerir la respuesta. Nunca se completa con «debe ser frustrante»: la palabra la tiene que poner la persona." />
              <Row label="¿Qué es lo que más te preocupa?" value="Separa lo que siente hoy de lo que teme mañana. Son dos cosas distintas y las dos importan." />
              <Row label="¿Qué desgaste te genera?" value="Mide el costo acumulado: la energía que se va todos los días en sostener la situación." />
              <Row label="¿Cómo impacta esto en tu vida o en tu empresa?" value="Muestra el alcance real. Casi siempre el problema laboral ya se mudó a otros lados." />
              <H>Qué escuchar</H>
              <Ul>
                <Li>El cambio de ritmo: cuando alguien baja la voz o se toma un segundo antes de contestar, ahí está lo importante.</Li>
                <Li>Los silencios. No se llenan.</Li>
                <Li>La palabra exacta que elige para nombrar lo que siente.</Li>
              </Ul>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: '¿La persona nombró con sus propias palabras lo que le genera la situación, sin que vos se lo hayas sugerido antes?' },
          ],
        },
        {
          id: 'e06',
          number: '06',
          title: 'Acompañamiento y entendimiento',
          subtitle: 'La devolución emocional',
          body: (
            <div className="space-y-4">
              <P>Acá el proceso cambia de dirección. Hasta este punto veníamos recibiendo información; a partir de acá empezamos a devolverla. Y se devuelve primero lo emocional, antes que lo racional: nadie acepta la explicación lógica de alguien que no lo entendió emocionalmente.</P>
              <H>Los cuatro movimientos</H>
              <Row label="Validar sus emociones" value="Reconocer que lo que siente tiene sentido dado todo lo que contó. No es darle la razón sobre los hechos: es aceptar su reacción como legítima." />
              <Row label="Reflejar lo que entendimos" value="Devolverle su situación con sus palabras, no con nuestros sinónimos." />
              <Row label="Confirmar que interpretamos correctamente" value="Explícitamente. Este movimiento convierte una interpretación tuya en un diagnóstico compartido, y es el que casi todos se saltean." />
              <Row label="Acompañar sin presionar" value="Se sostiene el silencio y se deja que la persona amplíe si quiere." />
              <H>Frases que funcionan</H>
              <div className="space-y-2">
                {[
                  'Tiene sentido que te sientas así.',
                  'Ahora entiendo por qué esta situación te preocupa.',
                  'Si estuviera en tu lugar, probablemente tendría la misma sensación.',
                  'Gracias por contármelo; entiendo mejor el contexto.',
                ].map(f => (
                  <div key={f} className="rounded-lg border border-brand-gold/15 bg-brand-gold/5 px-4 py-2.5">
                    <p className="text-sm text-brand-text italic">&ldquo;{f}&rdquo;</p>
                  </div>
                ))}
              </div>
              <Quote>Estas frases funcionan únicamente si son verdaderas. Dichas de memoria, se notan al instante y producen el efecto contrario.</Quote>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: '¿La persona amplió o corrigió lo que le devolviste? Si sólo dijo «sí» y se quedó callada, probablemente no se sintió comprendida: se sintió apurada.' },
          ],
        },
        {
          id: 'e07',
          number: '07',
          title: 'Justificar con lógica',
          subtitle: 'La devolución racional',
          body: (
            <div className="space-y-4">
              <P>Hasta acá el prospecto tenía piezas sueltas: un objetivo por un lado, unos síntomas por otro, un malestar que no sabía bien de dónde venía. La lógica conecta todo eso en una sola cadena causal.</P>
              <P>Recién en este momento la persona comprende racionalmente su propia situación. Y suele ser el momento en que piensa: &ldquo;esta persona entiende mi problema mejor que yo, que lo estoy viviendo&rdquo;.</P>
              <H>El ejemplo desarmado</H>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-3">
                <p className="text-sm text-brand-text italic leading-relaxed">&ldquo;Por lo que me contás, el problema no parece ser la falta de clientes. En realidad, el inconveniente es que no existe un proceso comercial predecible, y eso hace que dependan de recomendaciones. Esa dependencia genera incertidumbre, afecta la facturación y termina produciendo el estrés que me describías.&rdquo;</p>
              </div>
              <div className="space-y-2">
                <Row label="«Por lo que me contás…»" value="Atribuye la conclusión a los datos de la persona. No es tu opinión: es lo que se desprende de lo que dijo." />
                <Row label="«…no parece ser la falta de clientes»" value="Separa el síntoma del problema. Acá es donde cambia el eje de la conversación." />
                <Row label="«…no existe un proceso comercial predecible»" value="Nombra la causa raíz encontrada en la etapa 4." />
                <Row label="«…termina produciendo el estrés que me describías»" value="Cierra la cadena hasta el impacto emocional usando sus palabras." />
              </div>
              <Quote>Si algún eslabón de la cadena no salió de la conversación, la devolución se cae entera. Lo que no te dieron, no lo devolvés: lo preguntás.</Quote>
            </div>
          ),
          callouts: [
            { type: 'dominio', text: '¿La persona reformuló su propia situación con la nueva explicación? La señal clara es de nivel: deja de defender cómo viene trabajando y empieza a preguntar qué se hace con eso.' },
          ],
        },
        {
          id: 'e08',
          number: '08',
          title: 'Aportar valor',
          subtitle: 'El camino',
          body: (
            <div className="space-y-4">
              <P>Sólo después de completar todo el diagnóstico tiene sentido hablar de la solución. No presentamos características: mostramos el camino para resolver el problema identificado.</P>
              <Quote>Una solución presentada antes del diagnóstico es una suposición. La misma solución presentada después es una consecuencia.</Quote>
              <P>El valor se aporta durante toda la conversación. Cuando alguien cuenta que en una experiencia anterior lo dejaron solo, ahí mismo corresponde decirle que el acompañamiento existe y cómo funciona. Lo que hace esta etapa es ordenar el camino completo sobre el diagnóstico ya construido.</P>
              <H>Cómo se construye</H>
              <Row label="Regla de correspondencia" value="Cada elemento que presentás responde a un elemento del diagnóstico. Si algo de lo que decís no resuelve nada de lo relevado, sobra." />
              <Row label="Prueba de trazabilidad" value="Tenés que poder nombrar, para cada parte de la propuesta, el momento de la conversación del que surgió." />
              <Row label="Hablar del cambio, no del contenido" value="No qué incluye, sino qué deja de pasar y qué empieza a pasar en la situación concreta que acabás de describir." />
            </div>
          ),
          callouts: [
            { type: 'error', text: 'Presentar el producto entero «porque está bueno» · listar características · hablar de lo que la solución es en lugar de lo que resuelve · introducir beneficios que no corresponden a ningún problema relevado.' },
            { type: 'dominio', text: '¿La persona puede explicar qué cambia en su situación? Si sólo puede repetir qué incluye la propuesta, presentaste un producto en lugar de mostrar un camino.' },
          ],
        },
      ],
    },
    {
      id: 'cierre',
      label: 'Cierre',
      short: 'Cierre',
      icon: <Zap className="h-4 w-4" />,
      color: '#1a6fff',
      sections: [
        {
          id: 'reglas',
          title: 'Reglas transversales',
          subtitle: 'Lo que funciona en todas las etapas a la vez',
          body: (
            <div className="space-y-3">
              {[
                { n: '1', t: 'La estructura es del diagnóstico, no de la conversación', d: 'Las etapas están ordenadas porque cada una necesita lo que produjo la anterior. La conversación real va y viene — eso está bien. La estructura queda intacta en tu cabeza aunque la charla haya dado tres vueltas.' },
                { n: '2', t: 'Retener todo lo que ya te dieron', d: 'Una sola respuesta puede contener material de cinco etapas. Nunca se vuelve a preguntar lo ya contestado.' },
                { n: '3', t: 'Leer las puertas', d: 'Puerta cerrada: se cambia de tema con naturalidad, sin insistir ni disculparse. Puerta abierta: se entra, se acompaña y se vuelve.' },
                { n: '4', t: 'El bucle', d: 'Lo que dijo al principio se retoma después. Demuestra escucha y retención, y trae la conversación de vuelta al motivo real.' },
                { n: '5', t: 'Aporte de valor continuo', d: 'No es una etapa: es una constante. Cada vez que la persona expone algo que tu solución resuelve, ese es el momento de mostrarlo.' },
                { n: '6', t: 'Trazabilidad', d: 'Ninguna conclusión sin origen. Si no podés señalar de dónde salió, no la digas.' },
                { n: '7', t: 'El "no" es un resultado válido', d: 'Si el diagnóstico muestra que no podés ayudar a esa persona, decirlo es parte del trabajo.' },
              ].map(r => (
                <div key={r.n} className="flex gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                  <span className="text-brand-gold font-black text-lg w-5 shrink-0">{r.n}</span>
                  <div>
                    <p className="text-brand-text font-semibold text-sm mb-1">{r.t}</p>
                    <p className="text-brand-muted text-sm leading-relaxed">{r.d}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'tablero',
          title: 'Tablero de verificación',
          subtitle: 'Si no podés responder con las palabras del prospecto, la etapa no está cerrada',
          body: (
            <div className="space-y-2">
              <Row label="01 · Interés" value="¿Cuál es el resultado que busca, dicho con sus palabras, y qué lo trajo a esta conversación ahora?" />
              <Row label="02 · Situación actual" value="¿Cómo funciona hoy su proceso, qué resultados da y qué ya intentó antes?" />
              <Row label="03 · Síntomas" value="¿Cuáles son los efectos concretos que ve todos los días, desde cuándo y cuál pesa más?" />
              <Row label="04 · Problema real" value="¿Qué causa única explica la mayoría de esos síntomas, y de qué frase suya salió?" />
              <Row label="05 · Impacto" value="¿Con qué palabra nombró él lo que le genera la situación?" />
              <Row label="06 · Acompañamiento" value="¿Confirmó que entendiste bien, y amplió o corrigió algo al hacerlo?" />
              <Row label="07 · Lógica" value="¿Podés enunciar la cadena completa —objetivo, situación, síntomas, causa, impacto— sin ningún eslabón inventado?" />
              <Row label="08 · Valor" value="¿Cada parte de lo que presentaste corresponde a algo que la persona planteó?" />
            </div>
          ),
        },
        {
          id: 'errores',
          title: 'Errores que invalidan el diagnóstico',
          subtitle: 'No son errores de estilo — rompen la cadena causal entera',
          body: (
            <div className="space-y-2">
              {[
                { e: 'Proponer antes de diagnosticar', q: 'La propuesta responde a un síntoma. Es lo mismo que la persona ya probó sin resultado.' },
                { e: 'Quedarse en el primer síntoma', q: 'No hay causa. Todo lo que sigue se construye sobre un efecto.' },
                { e: 'Preguntar de forma textual', q: 'Suena a interrogatorio, la persona se cierra y las respuestas se vuelven mínimas.' },
                { e: 'Interrumpir', q: 'Se pierde justo la información que no venía preparada.' },
                { e: 'Repreguntar lo ya contestado', q: 'Demuestra que no escuchabas. La confianza construida durante media hora se cae en diez segundos.' },
                { e: 'Poner palabras en la boca del otro', q: 'El impacto emocional deja de ser suyo. En la etapa 7 no vas a tener nada real que devolver.' },
                { e: 'Escarbar en la emoción', q: 'Deja de ser diagnóstico y pasa a ser presión sobre alguien en un momento débil.' },
                { e: 'Saltear la etapa 6', q: 'La lógica llega sin permiso emocional y se percibe como un argumento de venta.' },
                { e: 'Inventar un eslabón', q: 'Rompe la trazabilidad. Una sola suposición dicha con seguridad invalida toda la devolución.' },
                { e: 'Insistir donde hay una puerta cerrada', q: 'Se activa la guardia, aparece la confrontación y se pierde la conversación entera.' },
              ].map(r => (
                <div key={r.e} className="flex gap-3 rounded-xl border border-red-800/20 bg-red-950/10 px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-semibold text-sm mb-0.5">{r.e}</p>
                    <p className="text-brand-muted text-xs leading-relaxed">{r.q}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: 'final',
          title: 'Principio Final',
          body: (
            <div className="space-y-6">
              <div className="rounded-2xl border border-brand-gold/25 bg-gradient-to-br from-[#0a1428] to-[#050d1e] p-8 text-center">
                <p className="text-xl md:text-2xl font-bold text-brand-text leading-relaxed max-w-2xl mx-auto">
                  Una venta consultiva no consiste en convencer a alguien de comprar. Consiste en conectar genuinamente, recolectar información de manera inteligente, comprender profundamente su realidad, descubrir el problema que realmente limita sus resultados, acompañarlo desde el entendimiento y ayudarlo a encontrar una solución que tenga sentido tanto emocional como racionalmente.
                </p>
                <p className="text-brand-gold text-xs uppercase tracking-widest mt-6">Areté Fuera de Serie · Equipos de venta de alto rendimiento</p>
              </div>
            </div>
          ),
        },
      ],
    },
  ],
};

// ─── RENDER ───────────────────────────────────────────────────────────────────

const MANUALS = [M01, M02];

export function ManualViewer() {
  const [manualIdx, setManualIdx] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [sectionIdx, setSectionIdx] = useState(0);

  const manual = MANUALS[manualIdx];
  const chapter = manual.chapters[chapterIdx];
  const section = chapter.sections[sectionIdx];

  function go(mI: number, cI: number, sI: number) {
    setManualIdx(mI); setChapterIdx(cI); setSectionIdx(sI);
  }

  // flat nav
  const flat: { mI: number; cI: number; sI: number }[] = [];
  MANUALS.forEach((m, mI) => m.chapters.forEach((c, cI) => c.sections.forEach((_, sI) => flat.push({ mI, cI, sI }))));
  const cur = flat.findIndex(f => f.mI === manualIdx && f.cI === chapterIdx && f.sI === sectionIdx);
  const prev = cur > 0 ? flat[cur - 1] : null;
  const next = cur < flat.length - 1 ? flat[cur + 1] : null;

  const prevLabel = prev ? MANUALS[prev.mI].chapters[prev.cI].sections[prev.sI].title : null;
  const nextLabel = next ? MANUALS[next.mI].chapters[next.cI].sections[next.sI].title : null;

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0a1428] via-[#050d1e] to-[#050505] border-b border-[rgba(26,111,255,0.15)] px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-gold mb-3">Areté Fuera de Serie · Formación</p>
          <h1 className="text-3xl md:text-4xl font-black text-brand-text mb-2">{manual.title}</h1>
          <p className="text-brand-muted text-sm max-w-2xl">{manual.description}</p>

          {/* Manual tabs */}
          <div className="flex gap-3 mt-8">
            {MANUALS.map((m, i) => (
              <button
                key={m.id}
                onClick={() => go(i, 0, 0)}
                className={cn(
                  'px-5 py-2 rounded-xl text-sm font-bold transition',
                  manualIdx === i
                    ? 'bg-brand-gold text-black'
                    : 'border border-[rgba(26,111,255,0.25)] text-brand-muted hover:text-brand-text hover:border-[rgba(26,111,255,0.5)]'
                )}
              >
                Manual {m.number}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Chapter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {manual.chapters.map((c, ci) => (
            <button
              key={c.id}
              onClick={() => go(manualIdx, ci, 0)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0',
                chapterIdx === ci
                  ? 'bg-[rgba(26,111,255,0.15)] text-brand-gold border border-[rgba(26,111,255,0.35)]'
                  : 'border border-white/8 text-brand-muted hover:text-brand-text hover:border-white/20'
              )}
            >
              {c.icon}
              {c.label}
            </button>
          ))}
        </div>

        {/* Section pills */}
        {chapter.sections.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {chapter.sections.map((s, si) => (
              <button
                key={s.id}
                onClick={() => go(manualIdx, chapterIdx, si)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition',
                  sectionIdx === si
                    ? 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40'
                    : 'border border-white/8 text-brand-muted hover:text-brand-text'
                )}
              >
                {s.number && <span className="font-mono mr-1 opacity-60">{s.number}·</span>}
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="card-premium space-y-6">
          <div className="border-b border-white/8 pb-5">
            {section.number && (
              <p className="text-[10px] uppercase tracking-widest text-brand-gold mb-2">Concepto {section.number}</p>
            )}
            <h2 className="text-2xl font-black text-brand-text">{section.title}</h2>
            {section.subtitle && <p className="text-brand-muted text-sm mt-1">{section.subtitle}</p>}
          </div>

          <div>{section.body}</div>

          {section.callouts && section.callouts.length > 0 && (
            <div className="space-y-3 border-t border-white/8 pt-5">
              {section.callouts.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-xl border px-4 py-3 flex gap-3',
                    c.type === 'dominio'
                      ? 'border-brand-gold/25 bg-[rgba(26,111,255,0.06)]'
                      : 'border-red-800/30 bg-red-950/10'
                  )}
                >
                  {c.type === 'dominio'
                    ? <Target className="h-4 w-4 text-brand-gold shrink-0 mt-0.5" />
                    : <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className={cn('text-[10px] font-bold uppercase tracking-widest mb-1', c.type === 'dominio' ? 'text-brand-gold' : 'text-red-400')}>
                      {c.type === 'dominio' ? 'Criterio de dominio' : 'Errores frecuentes'}
                    </p>
                    <p className="text-sm leading-relaxed text-brand-muted">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <button
            onClick={() => prev && go(prev.mI, prev.cI, prev.sI)}
            disabled={!prev}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-brand-muted hover:text-brand-text hover:border-white/25 transition disabled:opacity-30 text-sm max-w-[45%]"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <span className="truncate">{prevLabel ?? ''}</span>
          </button>
          <button
            onClick={() => next && go(next.mI, next.cI, next.sI)}
            disabled={!next}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(26,111,255,0.3)] text-brand-gold hover:bg-[rgba(26,111,255,0.08)] transition disabled:opacity-30 text-sm max-w-[45%]"
          >
            <span className="truncate">{nextLabel ?? ''}</span>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
