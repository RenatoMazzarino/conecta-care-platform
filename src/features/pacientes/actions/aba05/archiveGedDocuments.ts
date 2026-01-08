import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';

const documentIdsSchema = z.array(z.string().uuid()).min(1);

export async function archiveGedDocuments(documentIds: string[]) {
  const parsed = documentIdsSchema.safeParse(documentIds);
  if (!parsed.success) {
    throw new Error('IDs invalidos para arquivamento');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);
  const now = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('patient_documents')
    .update({
      document_status: 'Arquivado',
      status: 'Arquivado',
      updated_by: userId,
      last_updated_by: userId,
      last_updated_at: now,
    })
    .in('id', parsed.data)
    .is('deleted_at', null)
    .select('id');

  if (updateError) {
    if (isTenantMissingError(updateError)) {
      console.error('[patients] tenant_id ausente', updateError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(updateError.message);
  }

  const updatedIds = (updated ?? []).map((row) => row.id).filter(Boolean);
  if (updatedIds.length > 0) {
    const logRows = updatedIds.map((id) => ({
      document_id: id,
      action: 'archive',
      user_id: userId,
      details: { source: 'bulk_selection' } as Json,
    }));

    const { error: logError } = await supabase.from('patient_document_logs').insert(logRows);
    if (logError) {
      if (isTenantMissingError(logError)) {
        console.error('[patients] tenant_id ausente', logError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(logError.message);
    }
  }

  return { archived: updatedIds.length };
}
