import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const documentIdSchema = z.string().uuid();

type ManualApprovalPayload = {
  checklist?: Record<string, boolean>;
  review_notes?: string | null;
};

export async function approveLegalDocumentManual(documentId: string, payload?: ManualApprovalPayload) {
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

  const actorSnapshot = {
    id: userId,
    email: session?.user?.email ?? null,
  };

  const manualPayload = {
    checklist: payload?.checklist ?? {},
    review_notes: payload?.review_notes ?? null,
    approved_at: new Date().toISOString(),
    actor_snapshot: actorSnapshot,
  };

  const mergedPayload = {
    ...(existing?.document_validation_payload && typeof existing.document_validation_payload === 'object'
      ? existing.document_validation_payload
      : {}),
    manual: manualPayload,
  };

  const { data: document, error } = await supabase
    .from('patient_documents')
    .update({
      document_status: 'manual_approved',
      document_validation_payload: mergedPayload,
      updated_by: userId,
    })
    .eq('id', parsed.data)
    .is('deleted_at', null)
    .select('*')
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

  const { data: log, error: logError } = await supabase
    .from('patient_document_logs')
    .insert({
      document_id: document.id,
      action: 'manual_approved',
      user_id: userId,
      details: {
        document_status: 'manual_approved',
        checklist: manualPayload.checklist,
        review_notes: manualPayload.review_notes,
        actor_snapshot: actorSnapshot,
      },
    })
    .select('*')
    .maybeSingle();

  if (logError) {
    if (isTenantMissingError(logError)) {
      console.error('[patients] tenant_id ausente', logError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(logError.message);
  }

  return { document, log };
}
