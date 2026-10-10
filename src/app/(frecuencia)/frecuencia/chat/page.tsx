import { redirect } from 'next/navigation';
import { getCurrentUserContext } from '@/lib/current-user';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getModelosIA } from '@/lib/frecuencia-kb';
import { mensajesVisibles, type FilaMensaje } from '@/lib/frecuencia/ia/historial';
import { copy } from '../_copy';
import base from '../frecuencia.module.css';
import { ChatCliente } from './_chat-cliente';

export default async function ChatPage() {
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/dashboard');

  const supabase = createSupabaseServerClient();
  const modelos = await getModelosIA();

  const { data: conv } = await (supabase as any).from('frecuencia_conversaciones').select('id').eq('user_id', ctx.userId).eq('canal', 'texto').order('created_at', { ascending: false }).limit(1).maybeSingle();
  let mensajes: { rol: 'user' | 'assistant'; contenido: string }[] = [];
  if (conv) {
    const { data: filas } = await (supabase as any).from('frecuencia_mensajes').select('rol, contenido, created_at').eq('conversacion_id', conv.id).eq('user_id', ctx.userId).order('created_at', { ascending: true });
    mensajes = mensajesVisibles((filas ?? []) as FilaMensaje[]);
  }

  return (
    <div className={base.pantalla}>
      <div className={base.kicker}>
        <span className={`${base.kickerLine} ${base.on}`} />
        <span className={base.kickerLabel}>{copy.chat.kicker}</span>
      </div>
      <h1 className={base.titulo}>{copy.chat.titulo}</h1>
      <p className={base.subtitulo}>{copy.chat.subtitulo}</p>

      <ChatCliente
        conversacionInicial={conv?.id ?? null}
        mensajesIniciales={mensajes}
        modelos={modelos.chat.map((m) => ({ id: m.id, nombre: m.nombre, porDefecto: !!m.por_defecto }))}
      />
    </div>
  );
}
