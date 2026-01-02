import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';
import { resolveGedBucket } from './shared';

const artifactIdSchema = z.string().uuid();

export async function getGedArtifactDownloadUrl(artifactId: string) {
  const parsed = artifactIdSchema.safeParse(artifactId);
  if (!parsed.success) {
    throw new Error('ID do artefato invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: artifact, error } = await supabase
    .from('document_artifacts')
    .select('*')
    .eq('id', parsed.data)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  if (!artifact || !artifact.storage_path) {
    throw new Error('Artefato nao encontrado');
  }

  const bucket = resolveGedBucket();
  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(artifact.storage_path, 60 * 10, { download: true });

  if (signedError || !signed?.signedUrl) {
    throw new Error(signedError?.message || 'Falha ao gerar URL do artefato');
  }

  const { error: logError } = await supabase.from('patient_document_logs').insert({
    document_id: artifact.document_id,
    action: 'download_artifact',
    user_id: userId,
    details: {
      artifact_id: artifact.id,
      storage_path: artifact.storage_path,
    } as Json,
  });

  if (logError) {
    if (isTenantMissingError(logError)) {
      console.error('[patients] tenant_id ausente', logError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(logError.message);
  }

  return { url: signed.signedUrl };
}
