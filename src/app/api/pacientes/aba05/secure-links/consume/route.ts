import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/types/supabase';

const requestSchema = z.object({
  token: z.string().min(10),
});

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

function resolvePepper() {
  const pepper = process.env.GED_SECURE_LINK_PEPPER;
  if (pepper) return pepper;
  if (process.env.NODE_ENV === 'development') return 'dev-pepper';
  throw new Error('GED_SECURE_LINK_PEPPER nao configurado');
}

function hashToken(token: string, pepper: string) {
  return crypto.createHash('sha256').update(`${token}${pepper}`).digest('hex');
}

function resolveBucket() {
  return process.env.NEXT_PUBLIC_SUPABASE_GED_BUCKET || 'ged-documents';
}

async function updateRequestStatus(supabase: ReturnType<typeof getSupabaseUserClient>, requestId: string) {
  const { data: items, error } = await supabase
    .from('ged_original_request_items')
    .select('status')
    .eq('request_id', requestId)
    .is('deleted_at', null);

  if (error || !items || items.length === 0) {
    return;
  }

  const statuses = items.map((item) => item.status);
  const allConsumed = statuses.every((status) => status === 'consumed');
  const allRevoked = statuses.every((status) => status === 'revoked');
  const allExpired = statuses.every((status) => status === 'expired');

  let nextStatus = 'in_progress';
  if (allConsumed) nextStatus = 'completed';
  else if (allRevoked) nextStatus = 'revoked';
  else if (allExpired) nextStatus = 'expired';

  await supabase
    .from('ged_original_requests')
    .update({ status: nextStatus })
    .eq('id', requestId)
    .is('deleted_at', null);
}

async function updateRequestItemStatus(
  supabase: ReturnType<typeof getSupabaseUserClient>,
  linkId: string,
  status: 'revoked' | 'expired' | 'consumed',
) {
  const { data: updated, error } = await supabase
    .from('ged_original_request_items')
    .update({ status })
    .eq('secure_link_id', linkId)
    .is('deleted_at', null)
    .select('request_id');

  if (error || !updated || updated.length === 0) {
    return;
  }

  const requestId = updated[0]?.request_id;
  if (requestId) {
    await updateRequestStatus(supabase, requestId);
  }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';
  if (!token) {
    return new Response('Nao autorizado', { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response('Payload invalido', { status: 400 });
  }

  const supabase = getSupabaseUserClient(token);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response('Usuario nao autenticado', { status: 401 });
  }

  const pepper = resolvePepper();
  const tokenHash = hashToken(parsed.data.token, pepper);
  const now = new Date();

  const { data: link, error: linkError } = await supabase
    .from('document_secure_links')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('deleted_at', null)
    .maybeSingle();

  if (linkError) {
    return new Response(linkError.message, { status: 400 });
  }

  if (!link) {
    return new Response('Link nao encontrado', { status: 404 });
  }

  if (link.revoked_at) {
    await updateRequestItemStatus(supabase, link.id, 'revoked');
    return new Response('Link revogado', { status: 410 });
  }

  if (new Date(link.expires_at).getTime() < now.getTime()) {
    await updateRequestItemStatus(supabase, link.id, 'expired');
    return new Response('Link expirado', { status: 410 });
  }

  if (link.downloads_count >= link.max_downloads) {
    await updateRequestItemStatus(supabase, link.id, 'consumed');
    return new Response('Link ja consumido', { status: 410 });
  }

  const requestIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
  const requestAgent = request.headers.get('user-agent') || null;
  const baseMetadata =
    link.metadata && typeof link.metadata === 'object' && !Array.isArray(link.metadata)
      ? (link.metadata as Record<string, Json>)
      : {};
  const mergedMetadata: Json = {
    ...baseMetadata,
    consume_ip: requestIp,
    consume_user_agent: requestAgent,
  };

  const { data: document, error: documentError } = await supabase
    .from('patient_documents')
    .select('*')
    .eq('id', link.document_id)
    .is('deleted_at', null)
    .maybeSingle();

  if (documentError) {
    return new Response(documentError.message, { status: 400 });
  }

  if (!document || !document.storage_path) {
    return new Response('Documento sem storage_path', { status: 404 });
  }

  const nextDownloads = (link.downloads_count ?? 0) + 1;
  const shouldRevoke = nextDownloads >= link.max_downloads;

  const { error: updateError } = await supabase
    .from('document_secure_links')
    .update({
      downloads_count: nextDownloads,
      last_accessed_at: now.toISOString(),
      consumed_at: now.toISOString(),
      consumed_by: user.id,
      revoked_at: shouldRevoke ? now.toISOString() : link.revoked_at,
      revoked_by: shouldRevoke ? user.id : link.revoked_by,
      metadata: mergedMetadata,
    })
    .eq('id', link.id);

  if (updateError) {
    return new Response(updateError.message, { status: 400 });
  }

  const bucket = resolveBucket();
  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(document.storage_path, 60 * 10, { download: true });

  if (signedError || !signed?.signedUrl) {
    return new Response(signedError?.message || 'Falha ao gerar URL do original', { status: 400 });
  }

  await supabase.from('patient_document_logs').insert([
    {
      document_id: document.id,
      action: 'access_original',
      user_id: user.id,
      details: { link_id: link.id, ip: requestIp, user_agent: requestAgent },
    },
    {
      document_id: document.id,
      action: 'consume_original',
      user_id: user.id,
      details: { link_id: link.id, ip: requestIp, user_agent: requestAgent },
    },
  ]);

  await updateRequestItemStatus(supabase, link.id, 'consumed');

  return NextResponse.json({
    url: signed.signedUrl,
    expiresAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
  });
}
