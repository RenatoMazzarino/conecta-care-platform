import { z } from 'zod';
import { ensureSession } from '../aba03/shared';
import { getSupabaseClient } from '@/lib/supabase/client';
import { resolveAccessToken, resolveSecureLinkTtlHours } from './shared';

const schema = z.object({
  documentId: z.string().uuid(),
  ttlHours: z.number().int().positive().optional(),
});

export async function createGedSecureLink(documentId: string, ttlHours?: number) {
  const parsed = schema.safeParse({ documentId, ttlHours });
  if (!parsed.success) {
    throw new Error('Payload invalido para link seguro');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const accessToken = resolveAccessToken(session);
  if (!accessToken) {
    throw new Error('Sessao invalida para criar link seguro');
  }

  const response = await fetch('/api/pacientes/aba05/secure-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      documentId: parsed.data.documentId,
      ttlHours: parsed.data.ttlHours ?? resolveSecureLinkTtlHours(),
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Falha ao criar link seguro');
    throw new Error(message || 'Falha ao criar link seguro');
  }

  return response.json() as Promise<{
    token: string;
    expiresAt: string;
    linkId: string;
  }>;
}
