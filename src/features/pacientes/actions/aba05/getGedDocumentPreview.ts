import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError } from '../aba03/shared';
import { resolveGedBucket } from './shared';
import { logGedDocumentEvent } from './logGedDocumentEvent';

const documentIdSchema = z.string().uuid();

export async function getGedDocumentPreview(documentId: string) {
  const parsed = documentIdSchema.safeParse(documentId);
  if (!parsed.success) {
    throw new Error('ID do documento invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data: document, error } = await supabase
    .from('patient_documents')
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

  if (!document) {
    throw new Error('Documento nao encontrado');
  }

  if (!document.storage_path) {
    throw new Error('Documento sem storage_path');
  }

  const bucket = resolveGedBucket();
  const { data: signed, error: signedError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(document.storage_path, 60 * 10, { download: false });

  if (signedError) {
    throw new Error(signedError.message);
  }

  await logGedDocumentEvent(document.id, 'view', {
    storage_path: document.storage_path,
  });

  return {
    document,
    url: signed?.signedUrl ?? null,
  };
}
