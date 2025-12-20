import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';

const payloadSchema = z.object({
  addressId: z.string().uuid(),
  force: z.boolean().optional(),
});

const isDevBypassEnabled =
  process.env.NODE_ENV === 'development' && Boolean(process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN);

function makeActionError(code: string, message: string): Error {
  const error = new Error(message);
  (error as unknown as { code: string }).code = code;
  return error;
}

export type RiskRefreshResult = {
  status: string | null;
  provider: string | null;
  refreshedAt: string | null;
  cacheUntil: string | null;
  score: number | null;
  level: string | null;
  errorMessage: string | null;
};

export async function refreshAddressRisk(addressId: string, force = false): Promise<RiskRefreshResult> {
  const parsed = payloadSchema.safeParse({ addressId, force });
  if (!parsed.success) {
    throw new Error('Endereco invalido');
  }

  const supabase = getSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('[auth] getSession failed', sessionError);
  }

  const devToken = process.env.NEXT_PUBLIC_SUPABASE_DEV_ACCESS_TOKEN;
  const accessToken = session?.access_token ?? (isDevBypassEnabled ? devToken : undefined);
  if (!accessToken) {
    throw makeActionError('UNAUTHENTICATED', 'Faca login para acessar');
  }

  const response = await fetch('/api/pacientes/aba02/risk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Falha ao atualizar risco');
  }

  return (await response.json()) as RiskRefreshResult;
}
