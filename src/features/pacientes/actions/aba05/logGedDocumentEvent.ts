import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';

export async function logGedDocumentEvent(documentId: string, action: string, details?: Json | null) {
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { error } = await supabase.from('patient_document_logs').insert({
    document_id: documentId,
    action,
    user_id: userId,
    details: details ?? null,
  });

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return { ok: true };
}
