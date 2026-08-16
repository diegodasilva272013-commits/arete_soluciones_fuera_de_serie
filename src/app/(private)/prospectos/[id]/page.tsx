import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getCurrentUserContext } from '@/lib/current-user';
import ProspectDetailClient from './_ProspectDetailClient';

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getCurrentUserContext();
  if (!ctx) redirect('/login');

  const supabase = createSupabaseServerClient();

  const [{ data: prospect }, { data: analysis }, { data: messages }, { data: followUps }] = await Promise.all([
    supabase.from('prospects').select('*').eq('id', id).single(),
    supabase.from('prospect_analyses').select('*').eq('prospect_id', id).single(),
    supabase.from('generated_messages').select('*').eq('prospect_id', id).order('follow_up_number'),
    supabase.from('prospect_follow_ups').select('*').eq('prospect_id', id).order('follow_up_number'),
  ]);

  if (!prospect) notFound();

  return (
    <ProspectDetailClient
      prospect={prospect}
      analysis={analysis}
      messages={messages || []}
      followUps={followUps || []}
    />
  );
}
