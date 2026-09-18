import { redirect } from 'next/navigation';

/**
 * La raíz del dominio (aretesoluciones.space/) redirige a la página
 * institucional. La plataforma de la academia está en /plataforma.
 */
export default function RootPage() {
  redirect('/empresa');
}
