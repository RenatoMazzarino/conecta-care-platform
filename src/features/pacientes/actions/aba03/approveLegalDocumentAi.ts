import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Json } from '@/types/supabase';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const documentIdSchema = z.string().uuid();

type AiPayload = {
  status: 'simulated_passed';
  extracted?: Json;
};

export async function approveLegalDocumentAi(documentId: string, payload?: AiPayload) {
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

  const aiPayload: Json = {
    status: payload?.status ?? 'simulated_passed',
    extracted: payload?.extracted ?? {},
    finished_at: new Date().toISOString(),
  };

  const mergedPayload: Json = {
    ...(existing?.document_validation_payload && typeof existing.document_validation_payload === 'object'
      ? existing.document_validation_payload
      : {}),
    ai: aiPayload,
  };

  const { data: document, error } = await supabase
    .from('patient_documents')
    .update({
      document_status: 'ai_passed',
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

  const { error: logError } = await supabase
    .from('patient_document_logs')
    .insert({
      document_id: document.id,
      action: 'ai_passed',
      user_id: userId,
      details: {
        reason: 'Fluxo manual de homologacao da IA',
        ai: aiPayload,
      },
    });

  if (logError) {
    if (isTenantMissingError(logError)) {
      console.error('[patients] tenant_id ausente', logError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(logError.message);
  }

  return document;
}
