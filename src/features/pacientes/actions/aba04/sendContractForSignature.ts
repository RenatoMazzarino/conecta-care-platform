import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { resolveSignatureProvider } from '@/features/pacientes/services/aba04/signatureProvider';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const patientIdSchema = z.string().uuid();

const signatureRequestSchema = z.object({
  title: z.string().min(1),
  provider: z.string().nullable().optional(),
  category: z.enum(['legal', 'financial', 'consent', 'other']).optional(),
});

export type SignatureRequestInput = z.infer<typeof signatureRequestSchema>;

function buildFileName(title: string) {
  return `${title.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
}

function buildExternalPath(provider: string, envelopeId: string) {
  return `external://${provider}/${envelopeId}`;
}

export async function sendContractForSignature(patientId: string, payload: SignatureRequestInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = signatureRequestSchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const provider = resolveSignatureProvider(parsed.provider);
  const signature = await provider.sendContract({
    patientId: parsedPatientId.data,
    title: parsed.title,
    provider: parsed.provider ?? provider.name,
  });

  const fileName = buildFileName(parsed.title);
  const filePath = buildExternalPath(signature.provider, signature.envelope_id);
  const category = parsed.category ?? 'legal';

  const { data: document, error: documentError } = await supabase
    .from('patient_documents')
    .insert({
      patient_id: parsedPatientId.data,
      file_name: fileName,
      file_path: filePath,
      title: parsed.title,
      category,
      document_status: 'uploaded',
      status: signature.status,
      signature_type: signature.provider,
      external_signature_id: signature.envelope_id,
      document_validation_payload: {
        provider: signature.provider,
        envelope_id: signature.envelope_id,
        status: signature.status,
        sent_at: signature.sent_at,
      } as Json,
      uploaded_by: userId,
      created_by: userId,
    })
    .select('*')
    .maybeSingle();

  if (documentError) {
    if (isTenantMissingError(documentError)) {
      console.error('[patients] tenant_id ausente', documentError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(documentError.message);
  }

  if (!document) {
    throw new Error('Falha ao registrar documento de assinatura');
  }

  const { error: logError } = await supabase.from('patient_document_logs').insert({
    document_id: document.id,
    action: 'contract_sent',
    user_id: userId,
    details: {
      provider: signature.provider,
      envelope_id: signature.envelope_id,
      status: signature.status,
    } as Json,
  });

  if (logError) {
    if (isTenantMissingError(logError)) {
      console.error('[patients] tenant_id ausente', logError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(logError.message);
  }

  await recordPatientTimelineEvent(parsedPatientId.data, {
    event_type: 'contract_sent',
    event_category: 'signature',
    title: 'Contrato enviado para assinatura',
    payload: {
      provider: signature.provider,
      envelope_id: signature.envelope_id,
    },
  });

  return { document, signature };
}
