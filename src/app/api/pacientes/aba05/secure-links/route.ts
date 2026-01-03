import { NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const requestSchema = z.object({
  documentId: z.string().uuid(),
  ttlHours: z.number().int().positive().optional(),
  requestId: z.string().uuid().optional(),
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

function resolveTtlHours(explicit?: number) {
  if (explicit && explicit > 0) return explicit;
  const override = process.env.GED_SECURE_LINK_TTL_HOURS;
  if (override) {
    const parsed = Number.parseInt(override, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return process.env.NODE_ENV === 'development' ? 24 * 7 : 72;
}

function hashToken(token: string, pepper: string) {
  return crypto.createHash('sha256').update(`${token}${pepper}`).digest('hex');
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
  const plainToken = crypto.randomUUID();
  const tokenHash = hashToken(plainToken, pepper);
  const ttlHours = resolveTtlHours(parsed.data.ttlHours);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000).toISOString();

  const metadata = {
    user_agent: request.headers.get('user-agent') || null,
    ip: request.headers.get('x-forwarded-for') || null,
    request_id: parsed.data.requestId ?? null,
  };

  const { data: link, error: insertError } = await supabase
    .from('document_secure_links')
    .insert({
      document_id: parsed.data.documentId,
      token_hash: tokenHash,
      expires_at: expiresAt,
      max_downloads: 1,
      downloads_count: 0,
      requested_by: user.id,
      requested_at: now.toISOString(),
      issued_by: user.id,
      issued_at: now.toISOString(),
      metadata,
    })
    .select('*')
    .maybeSingle();

  if (insertError) {
    return new Response(insertError.message, { status: 400 });
  }

  await supabase.from('patient_document_logs').insert([
    {
      document_id: parsed.data.documentId,
      action: 'request_original',
      user_id: user.id,
      details: { expires_at: expiresAt, request_id: parsed.data.requestId ?? null },
    },
    {
      document_id: parsed.data.documentId,
      action: 'grant_original',
      user_id: user.id,
      details: { link_id: link?.id ?? null, request_id: parsed.data.requestId ?? null },
    },
  ]);

  return NextResponse.json({
    token: plainToken,
    expiresAt,
    linkId: link?.id ?? null,
  });
}
