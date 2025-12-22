import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const documentIdSchema = z.string().uuid();

type ManualDraftPayload = {
  checklist?: Record<string, boolean>;
  review_notes?: string | null;
};

export async function saveLegalDocumentManualDraft(documentId: string, payload: ManualDraftPayload) {
  const parsed = documentIdSchema.safeParse(documentId);
  if (!parsed.success) {
    throw new Error('ID do documento invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: existing, error: existingError } = await supabase
    .from('patient_documents')
    .select('document_validation_payload')
    .eq('id', parsed.data)
    .is('deleted_at', null)
    .maybeSingle();

  if (existingError) {
    if (isTenantMissingError(existingError)) {
      console.error('[patients] tenant_id ausente', existingError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(existingError.message);
  }

  const manualPayload = {
    checklist: payload.checklist ?? {},
    review_notes: payload.review_notes ?? null,
    saved_at: new Date().toISOString(),
  };

  const mergedPayload = {
    ...(existing?.document_validation_payload && typeof existing.document_validation_payload === 'object'
      ? existing.document_validation_payload
      : {}),
    manual: manualPayload,
  };

  const { error: updateError } = await supabase
    .from('patient_documents')
    .update({
      document_validation_payload: mergedPayload,
      updated_by: userId,
    })
    .eq('id', parsed.data)
    .is('deleted_at', null);

  if (updateError) {
    if (isTenantMissingError(updateError)) {
      console.error('[patients] tenant_id ausente', updateError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(updateError.message);
  }

  const { error: logError } = await supabase
    .from('patient_document_logs')
    .insert({
      document_id: parsed.data,
      action: 'manual_draft_saved',
      user_id: userId,
      details: manualPayload,
    });

  if (logError) {
    if (isTenantMissingError(logError)) {
      console.error('[patients] tenant_id ausente', logError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(logError.message);
  }

  return { ok: true };
}
