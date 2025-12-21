import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const documentIdSchema = z.string().uuid();

export async function approveLegalDocumentManual(documentId: string) {
  const parsed = documentIdSchema.safeParse(documentId);
  if (!parsed.success) {
    throw new Error('ID do documento invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: document, error } = await supabase
    .from('patient_documents')
    .update({ document_status: 'manual_approved', updated_by: userId })
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
      details: { document_status: 'manual_approved' },
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
