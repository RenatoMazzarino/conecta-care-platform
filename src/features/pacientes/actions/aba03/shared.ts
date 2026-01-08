import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const isDevBypassEnabled =
  process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN);

export function makeActionError(code: string, message: string): Error {
  const error = new Error(message);
  (error as unknown as { code: string }).code = code;
  return error;
}

export function isTenantMissingError(error: { code?: string | null; message?: string }) {
  return error.code === '22023' || Boolean(error.message?.includes('tenant_id ausente'));
}

export async function ensureSession(supabase: SupabaseClient<Database>) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('[auth] getSession failed', error);
  }

  if (!session && !isDevBypassEnabled) {
    throw makeActionError('UNAUTHENTICATED', 'Faca login para acessar');
  }

  if (session) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      await supabase.auth.signOut();
      throw makeActionError('UNAUTHENTICATED', 'Sessao expirada. Faca login novamente.');
    }
  }

  return session ?? null;
}

export function safeUserId(session: { user?: { id?: string | null } } | null) {
  return session?.user?.id ?? null;
}

export function resolveBoolean(value: boolean | null | undefined, fallback = false) {
  if (typeof value === 'boolean') return value;
  return fallback;
}
