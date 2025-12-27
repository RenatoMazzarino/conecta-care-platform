import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { resolveDocumentIngestionProvider } from '@/features/pacientes/services/aba04/documentIngestionProvider';
import { recordPatientTimelineEvent } from './recordPatientTimelineEvent';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const patientIdSchema = z.string().uuid();

const ingestionRequestSchema = z.object({
  item_code: z.string().min(1),
  title: z.string().min(1),
  provider: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  document_id: z.string().uuid().nullable().optional(),
});

export type ChecklistDocumentIngestionInput = z.infer<typeof ingestionRequestSchema>;

function buildFileName(title: string) {
  return `${title.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
}

function buildExternalPath(provider: string, ingestionId: string) {
  return `external://${provider}/${ingestionId}`;
}

export async function requestChecklistDocumentIngestion(patientId: string, payload: ChecklistDocumentIngestionInput) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsed = ingestionRequestSchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: checklistRow, error: checklistError } = await supabase
    .from('patient_onboarding_checklist')
    .select('*')
    .eq('patient_id', parsedPatientId.data)
    .eq('item_code', parsed.item_code)
    .is('deleted_at', null)
    .maybeSingle();

  if (checklistError) {
    if (isTenantMissingError(checklistError)) {
      console.error('[patients] tenant_id ausente', checklistError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(checklistError.message);
  }

  if (!checklistRow) {
    throw new Error('Item do checklist nao encontrado');
  }

  const provider = resolveDocumentIngestionProvider(parsed.provider);
  const ingestion = await provider.requestIngestion({
    patientId: parsedPatientId.data,
    itemCode: parsed.item_code,
    title: parsed.title,
    provider: parsed.provider ?? provider.name,
    documentId: parsed.document_id ?? null,
  });

  let documentId = parsed.document_id ?? null;
  let document: Record<string, unknown> | null = null;

  if (!documentId) {
    const fileName = buildFileName(parsed.title);
    const filePath = buildExternalPath(ingestion.provider, ingestion.ingestion_id);
    const category = parsed.category ?? 'checklist';

    const { data: created, error: documentError } = await supabase
      .from('patient_documents')
      .insert({
        patient_id: parsedPatientId.data,
        file_name: fileName,
        file_path: filePath,
        title: parsed.title,
        category,
        document_status: 'uploaded',
        status: ingestion.status,
        document_validation_payload: {
          provider: ingestion.provider,
          ingestion_id: ingestion.ingestion_id,
          status: ingestion.status,
          requested_at: ingestion.requested_at,
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

    if (!created) {
      throw new Error('Falha ao registrar documento do checklist');
    }

    document = created as Record<string, unknown>;
    documentId = created.id as string;
  }

  if (!documentId) {
    throw new Error('Documento do checklist nao identificado');
  }

  const { error: logError } = await supabase.from('patient_document_logs').insert({
    document_id: documentId,
    action: 'ingestion_requested',
    user_id: userId,
    details: {
      provider: ingestion.provider,
      ingestion_id: ingestion.ingestion_id,
      status: ingestion.status,
    } as Json,
  });

  if (logError) {
    if (isTenantMissingError(logError)) {
      console.error('[patients] tenant_id ausente', logError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(logError.message);
  }

  let updatedChecklist = checklistRow;

  if (documentId && checklistRow.document_id !== documentId) {
    const { data: updated, error: updateError } = await supabase
      .from('patient_onboarding_checklist')
      .update({
        document_id: documentId,
        updated_by: userId,
      })
      .eq('id', checklistRow.id)
      .select('*')
      .maybeSingle();

    if (updateError) {
      if (isTenantMissingError(updateError)) {
        console.error('[patients] tenant_id ausente', updateError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(updateError.message);
    }

    if (updated) {
      updatedChecklist = updated;
    }
  }

  await recordPatientTimelineEvent(parsedPatientId.data, {
    event_type: 'checklist_document_ingestion_requested',
    event_category: 'checklist',
    title: 'Ingestao de documento solicitada',
    payload: {
      item_code: parsed.item_code,
      document_id: documentId,
      provider: ingestion.provider,
      ingestion_id: ingestion.ingestion_id,
      status: ingestion.status,
    },
  });

  return {
    ingestion,
    document,
    checklist: updatedChecklist,
  };
}
