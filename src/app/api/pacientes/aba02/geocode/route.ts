import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { resolveGeocodeProvider } from '@/features/pacientes/services/geocode/provider';

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
    status: row.geocode_status ?? null,
    provider: row.geocode_provider ?? null,
    refreshedAt: row.geocode_refreshed_at ?? null,
    cacheUntil: row.geocode_cache_until ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    errorMessage: row.geocode_error_message ?? null,
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
  const cacheUntil = address.geocode_cache_until ? new Date(address.geocode_cache_until) : null;
  const shouldUseCache =
    !parsed.data.force &&
    cacheUntil &&
    cacheUntil.getTime() > now.getTime() &&
    address.geocode_status === 'success';

  if (shouldUseCache) {
    return NextResponse.json(buildResponse(address));
  }

  const provider = resolveGeocodeProvider();
  if (!provider) {
    const { data: updated } = await supabase
      .from('patient_addresses')
      .update({
        geocode_status: 'not_configured',
        geocode_refreshed_at: now.toISOString(),
        geocode_error_message: 'Provider nao configurado',
        geocode_cache_until: null,
      })
      .eq('id', address.id)
      .select('*')
      .maybeSingle();

    return NextResponse.json(buildResponse(updated ?? address));
  }

  try {
    const result = await provider.geocode({
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
    });

    const refreshedAt = now.toISOString();
    const cacheUntilValue = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: updated, error: updateError } = await supabase
      .from('patient_addresses')
      .update({
        latitude: result.latitude,
        longitude: result.longitude,
        geocode_status: 'success',
        geocode_provider: provider.id,
        geocode_refreshed_at: refreshedAt,
        geocode_cache_until: cacheUntilValue,
        geocode_precision: result.precision ?? null,
        geocode_place_id: result.placeId ?? null,
        geocode_payload: result.payload ?? null,
        geocode_error_message: null,
      })
      .eq('id', address.id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      return new Response(updateError.message, { status: 400 });
    }

    return NextResponse.json(buildResponse(updated ?? address));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao geocodificar';
    const trimmed = message.slice(0, 200);

    const { data: updated } = await supabase
      .from('patient_addresses')
      .update({
        geocode_status: 'failed',
        geocode_refreshed_at: now.toISOString(),
        geocode_error_message: trimmed,
        geocode_cache_until: null,
      })
      .eq('id', address.id)
      .select('*')
      .maybeSingle();

    return NextResponse.json(buildResponse(updated ?? address));
  }
}
