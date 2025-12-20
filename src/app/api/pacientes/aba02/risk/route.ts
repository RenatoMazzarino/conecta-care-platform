import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { resolveRiskProvider } from '@/features/pacientes/services/risk/provider';

const requestSchema = z.object({
  addressId: z.string().uuid(),
  force: z.boolean().optional(),
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

function buildResponse(row: Database['public']['Tables']['patient_addresses']['Row']) {
  return {
    status: row.risk_status ?? null,
    provider: row.risk_provider ?? null,
    refreshedAt: row.risk_refreshed_at ?? null,
    cacheUntil: row.risk_cache_until ?? null,
    score: row.risk_score ?? null,
    level: row.risk_level ?? null,
    errorMessage: row.risk_error_message ?? null,
  };
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
  const { data: address, error } = await supabase
    .from('patient_addresses')
    .select('*')
    .eq('id', parsed.data.addressId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  if (!address) {
    return new Response('Endereco nao encontrado', { status: 404 });
  }

  const now = new Date();
  const cacheUntil = address.risk_cache_until ? new Date(address.risk_cache_until) : null;
  const shouldUseCache =
    !parsed.data.force && cacheUntil && cacheUntil.getTime() > now.getTime() && address.risk_status === 'success';

  if (shouldUseCache) {
    return NextResponse.json(buildResponse(address));
  }

  if (address.latitude == null || address.longitude == null) {
    const { data: updated } = await supabase
      .from('patient_addresses')
      .update({
        risk_status: 'failed',
        risk_refreshed_at: now.toISOString(),
        risk_error_message: 'Endereco sem coordenadas',
        risk_cache_until: null,
      })
      .eq('id', address.id)
      .select('*')
      .maybeSingle();

    return NextResponse.json(buildResponse(updated ?? address));
  }

  const provider = resolveRiskProvider();
  if (!provider) {
    const { data: updated } = await supabase
      .from('patient_addresses')
      .update({
        risk_status: 'not_configured',
        risk_refreshed_at: now.toISOString(),
        risk_error_message: 'Provider nao configurado',
        risk_cache_until: null,
      })
      .eq('id', address.id)
      .select('*')
      .maybeSingle();

    return NextResponse.json(buildResponse(updated ?? address));
  }

  try {
    const result = await provider.fetchRisk({ latitude: address.latitude, longitude: address.longitude });
    const refreshedAt = now.toISOString();
    const cacheUntilValue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: updated, error: updateError } = await supabase
      .from('patient_addresses')
      .update({
        risk_status: 'success',
        risk_provider: provider.id,
        risk_score: result.score,
        risk_level: result.level,
        risk_payload: result.payload,
        risk_refreshed_at: refreshedAt,
        risk_cache_until: cacheUntilValue,
        risk_error_message: null,
      })
      .eq('id', address.id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      return new Response(updateError.message, { status: 400 });
    }

    return NextResponse.json(buildResponse(updated ?? address));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao atualizar risco';
    const trimmed = message.slice(0, 200);

    const { data: updated } = await supabase
      .from('patient_addresses')
      .update({
        risk_status: 'failed',
        risk_refreshed_at: now.toISOString(),
        risk_error_message: trimmed,
        risk_cache_until: null,
      })
      .eq('id', address.id)
      .select('*')
      .maybeSingle();

    return NextResponse.json(buildResponse(updated ?? address));
  }
}
