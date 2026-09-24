/**
 * Fuente única de verdad para SEO de la web pública de Areté.
 * Títulos, descriptions, H1, keywords y alts salen de acá.
 * Los componentes consumen esto — cero strings SEO hardcodeados en componentes.
 */

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aretesoluciones.space';

// ── Páginas existentes ───────────────────────────────────────────────────────

export const SEO = {
  home: {
    title:       'Areté Soluciones — Sistemas a medida y capacitación en ventas',
    description: 'Diagnóstico de procesos, software a medida y automatización para empresas. Y Fuera de Serie: formación de equipos de venta de alto rendimiento.',
    h1:          'Sistemas a medida y formación comercial para empresas',
    canonical:   '/empresa',
  },

  servicios: {
    title:       'Consultoría de procesos y sistemas a medida',
    description: 'Diagnóstico operativo e implementación de sistemas a medida para pymes y empresas: ventas, marketing, administración y operaciones en un solo sistema.',
    h1:          'Consultoría de procesos y sistemas a medida para empresas',
    canonical:   '/empresa/servicios',
  },

  diagnosticoOperativo: {
    title:       'Diagnóstico operativo y auditoría de procesos',
    description: 'Relevamos cómo trabaja tu empresa de verdad, detectamos dónde se pierde tiempo y plata y priorizamos qué resolver. Auditoría de procesos para pymes.',
    h1:          'Diagnóstico operativo y auditoría de procesos para empresas',
    canonical:   '/empresa/servicios/diagnostico-operativo',
  },

  softwareAMedida: {
    title:       'Desarrollo de software a medida para empresas',
    description: 'Desarrollamos software a medida que se adapta a cómo trabaja tu empresa, no al revés. Sistemas de gestión para pymes en Argentina y Latinoamérica.',
    h1:          'Desarrollo de software a medida para empresas y pymes',
    canonical:   '/empresa/servicios/software-a-medida',
  },

  crmErpAMedida: {
    title:       'CRM y ERP a medida para pymes',
    description: 'CRM y ERP a medida: ventas, clientes, facturación y operación en un solo sistema, diseñado sobre cómo trabaja tu empresa. Sin licencias que no usás.',
    h1:          'CRM y ERP a medida para pymes',
    canonical:   '/empresa/servicios/crm-erp-a-medida',
  },

  automatizacion: {
    title:       'Automatización de procesos para empresas',
    description: 'Automatizamos tareas repetitivas e integramos tus sistemas para que nadie copie datos a mano. Primero ordenamos el proceso, después lo automatizamos.',
    h1:          'Automatización de procesos para empresas y pymes',
    canonical:   '/empresa/servicios/automatizacion-de-procesos',
  },

  agentesIa: {
    title:       'Agentes de voz con IA para empresas',
    description: 'Agentes de voz y de WhatsApp con IA que atienden, califican y agendan 24/7. Probalos en vivo: casos reales implementados por Areté.',
    h1:          'Agentes de voz con IA para empresas, en acción',
    canonical:   '/empresa/agentes-ia',
  },

  metodologia: {
    title:       'Método de implementación en 6 etapas',
    description: 'Las seis etapas del método Areté: de la inmersión en la operación a la evolución continua del sistema.',
    h1:          'Nuestro método de diagnóstico e implementación',
    canonical:   '/empresa/metodologia',
  },

  nosotros: {
    title:       'Nosotros — consultora de procesos y sistemas',
    description: 'Quiénes somos, el Principio Areté y por qué diseñamos sistemas que se adaptan a la empresa, no al revés.',
    h1:          'El Principio Areté',
    canonical:   '/empresa/nosotros',
  },

  resultados: {
    title:       'Resultados — casos reales del método Areté',
    description: 'Casos reales, métricas concretas y lo que dicen quienes pasaron por el método Areté.',
    h1:          'Lo que generamos',
    canonical:   '/empresa/resultados',
  },

  equipo: {
    title:       'El equipo de Areté Soluciones',
    description: 'El equipo detrás del sistema: quiénes diagnostican, diseñan e implementan en cada proyecto.',
    h1:          'El equipo',
    canonical:   '/empresa/equipo',
  },

  contacto: {
    title:       'Contacto',
    description: 'Contactate con Areté Soluciones para empezar con un diagnóstico o consultar sobre tus sistemas.',
    h1:          'Hablemos',
    canonical:   '/empresa/contacto',
  },
} as const;

// ── Fuera de Serie ───────────────────────────────────────────────────────────

export const SEO_FDS = {
  hub: {
    title:       'Capacitación en ventas | Areté Fuera de Serie',
    description: 'Formación de equipos de venta de alto rendimiento. No entrenamos respuestas: entrenamos criterio sobre llamadas reales. Para empresas y quienes ya venden.',
    h1:          'Capacitación en ventas para equipos de alto rendimiento',
    canonical:   '/fuera-de-serie',
  },

  capacitacionEquipos: {
    title:       'Capacitación de equipos de venta para empresas',
    description: 'Entrenamos a tu equipo comercial sobre sus propias llamadas: diagnóstico, calificación y conversación consultiva. Capacitación comercial B2B.',
    h1:          'Capacitación de equipos de venta para empresas',
    canonical:   '/fuera-de-serie/capacitacion-equipos-de-venta',
  },

  ventaConsultiva: {
    title:       'Programa de venta consultiva: 6 semanas',
    description: 'Programa de 6 semanas para quienes ya venden, sobre tus llamadas reales. Planes Formación (grupos de 4) e Inmersión (1 a 1 diario) con mentoría.',
    h1:          'Programa de venta consultiva para quienes ya venden',
    canonical:   '/fuera-de-serie/programa-venta-consultiva',
  },

  incorporarEquipo: {
    title:       'Incorporá comerciales capacitados a tu empresa',
    description: 'Sumá a tu empresa personas formadas en venta consultiva por Areté Fuera de Serie, entrenadas con método, evaluación y conversaciones reales.',
    h1:          'Incorporá comerciales capacitados a tu equipo',
    canonical:   '/fuera-de-serie/incorporar-equipo-comercial',
  },
} as const;

// ── Alts de imágenes por contexto ────────────────────────────────────────────

export const ALTS = {
  galeria: [
    'Reunión de diagnóstico operativo con el equipo directivo de una empresa',
    'Tablero de un sistema de gestión a medida desarrollado por Areté Soluciones',
    'Equipo comercial entrenando una conversación en la plataforma de Fuera de Serie',
    'Mapa de procesos de una empresa antes de la implementación de sistemas',
    'Panel de control de leads y pipeline comercial en la plataforma Areté',
    'Equipo de Areté Soluciones en sesión de auditoría operativa',
    'Prototipo de sistema de entrega y operaciones diseñado a medida',
    'Reunión de seguimiento post-implementación con cliente de Areté',
    'Vista del simulador de conversaciones de la plataforma Fuera de Serie',
    'Dashboard de indicadores de gestión para dirección de empresa',
  ],
  logoArete:       'Areté Soluciones — consultora de procesos y sistemas a medida',
  videoDiagnostico: 'Proceso de diagnóstico operativo en una empresa cliente de Areté',
  videoPlataforma:  'Plataforma de entrenamiento de Areté Fuera de Serie en uso',
} as const;

// ── Rutas públicas para el sitemap ───────────────────────────────────────────

export const PUBLIC_ROUTES = [
  { path: '/empresa',                                         priority: 1.0,  changefreq: 'monthly'  },
  { path: '/empresa/servicios',                              priority: 0.9,  changefreq: 'monthly'  },
  { path: '/empresa/servicios/diagnostico-operativo',        priority: 0.85, changefreq: 'monthly'  },
  { path: '/empresa/servicios/software-a-medida',            priority: 0.85, changefreq: 'monthly'  },
  { path: '/empresa/servicios/crm-erp-a-medida',             priority: 0.85, changefreq: 'monthly'  },
  { path: '/empresa/servicios/automatizacion-de-procesos',   priority: 0.85, changefreq: 'monthly'  },
  { path: '/empresa/agentes-ia',                             priority: 0.8,  changefreq: 'monthly'  },
  { path: '/empresa/metodologia',                            priority: 0.7,  changefreq: 'monthly'  },
  { path: '/empresa/nosotros',                               priority: 0.6,  changefreq: 'monthly'  },
  { path: '/empresa/resultados',                             priority: 0.65, changefreq: 'monthly'  },
  { path: '/empresa/equipo',                                 priority: 0.5,  changefreq: 'monthly'  },
  { path: '/empresa/contacto',                               priority: 0.6,  changefreq: 'monthly'  },
  { path: '/fuera-de-serie',                                 priority: 0.9,  changefreq: 'monthly'  },
  { path: '/fuera-de-serie/capacitacion-equipos-de-venta',   priority: 0.85, changefreq: 'monthly'  },
  { path: '/fuera-de-serie/programa-venta-consultiva',       priority: 0.85, changefreq: 'monthly'  },
  { path: '/fuera-de-serie/incorporar-equipo-comercial',     priority: 0.7,  changefreq: 'monthly'  },
] as const;
