import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const documentIdSchema = z.string().uuid();

const isAiEnabled = process.env.NEXT_PUBLIC_LEGAL_DOC_AI_ENABLED === 'true';

export async function requestLegalDocAiCheck(documentId: string) {
  const parsed = documentIdSchema.safeParse(documentId);
  if (!parsed.success) {
    throw new Error('ID do documento invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  if (!isAiEnabled) {
    const { data: log, error: logError } = await supabase
      .from('patient_document_logs')
      .insert({
        document_id: parsed.data,
        action: 'ai_disabled',
        user_id: userId,
        details: { reason: 'LEGAL_DOC_AI_ENABLED=false' },
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

    return { status: 'disabled', log };
  }

  const { data: document, error } = await supabase
    .from('patient_documents')
    .update({
      document_status: 'ai_failed',
      document_validation_payload: {
        provider: 'none',
        status: 'failed',
        reason: 'AI provider nao configurado',
      },
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
      action: 'ai_failed',
      user_id: userId,
      details: {
        status: 'ai_failed',
        reason: 'AI provider nao configurado',
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

  return { status: 'ai_failed', document, log };
}
