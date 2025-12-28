import { z } from 'zod';
import { ensureSession } from '../aba03/shared';
import { getSupabaseClient } from '@/lib/supabase/client';
import { resolveAccessToken } from './shared';

const schema = z.object({
  token: z.string().min(10),
});

export async function consumeGedSecureLink(token: string) {
  const parsed = schema.safeParse({ token });
  if (!parsed.success) {
    throw new Error('Token invalido');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const accessToken = resolveAccessToken(session);
  if (!accessToken) {
    throw new Error('Sessao invalida para consumir link seguro');
  }

  const response = await fetch('/api/pacientes/aba05/secure-links/consume', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ token: parsed.data.token }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Falha ao consumir link seguro');
    throw new Error(message || 'Falha ao consumir link seguro');
  }

  return response.json() as Promise<{
    url: string;
    expiresAt: string;
  }>;
}
