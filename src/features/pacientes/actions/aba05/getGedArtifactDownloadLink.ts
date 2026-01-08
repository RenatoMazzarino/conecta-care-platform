import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession } from '../aba03/shared';
import { resolveAccessToken } from './shared';

const artifactIdSchema = z.string().uuid();

export async function getGedArtifactDownloadLink(artifactId: string) {
  const parsed = artifactIdSchema.safeParse(artifactId);
  if (!parsed.success) {
    throw new Error('ID do artefato invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const accessToken = resolveAccessToken(session);
  if (!accessToken) {
    throw new Error('Sessao invalida para baixar artefato');
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}/api/ged/artifacts/${parsed.data}/download?token=${encodeURIComponent(accessToken)}`;

  return { url };
}
