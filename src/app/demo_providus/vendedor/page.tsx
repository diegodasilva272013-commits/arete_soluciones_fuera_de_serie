import type { Metadata } from 'next';
import { Vendedor } from './_vendedor';

export const metadata: Metadata = { title: 'Vendedores · Providus' };

// Pantalla de los vendedores: los leads de su zona llegan solos, para llamarlos ya.
export default function VendedorPage() {
  return <Vendedor />;
}
