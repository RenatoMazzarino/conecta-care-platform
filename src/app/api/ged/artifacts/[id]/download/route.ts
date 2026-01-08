import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

function getSupabaseUserClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env nao configurado');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

function resolveBucket() {
  return process.env.NEXT_PUBLIC_SUPABASE_GED_BUCKET || 'ged-documents';
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!id) {
    return new Response('Artefato nao informado', { status: 400 });
  }

  const authHeader = request.headers.get('authorization') || '';
  const headerToken = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';
  const url = new URL(request.url);
  const queryToken = url.searchParams.get('token')?.trim() ?? '';
  const token = queryToken || headerToken;

  if (!token) {
    return new Response('Nao autorizado', { status: 401 });
  }

  const supabase = getSupabaseUserClient(token);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response('Usuario nao autenticado', { status: 401 });
  }

  const { data: artifact, error: artifactError } = await supabase
    .from('document_artifacts')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (artifactError) {
    return new Response(artifactError.message, { status: 400 });
  }

  if (!artifact || !artifact.storage_path) {
    return new Response('Artefato nao encontrado', { status: 404 });
  }

  const bucket = resolveBucket();
  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(artifact.storage_path, 60 * 10, { download: true });

  if (signedError || !signed?.signedUrl) {
    return new Response(signedError?.message || 'Falha ao gerar URL do artefato', { status: 400 });
  }

  const requestIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
  const requestAgent = request.headers.get('user-agent') || null;

  await supabase.from('patient_document_logs').insert({
    document_id: artifact.document_id,
    action: 'download_artifact',
    user_id: user.id,
    details: {
      artifact_id: artifact.id,
      storage_path: artifact.storage_path,
      ip: requestIp,
      user_agent: requestAgent,
    },
  });

  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
