import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { Json } from '@/types/supabase';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from './shared';

const patientIdSchema = z.string().uuid();
const relatedPersonIdSchema = z.string().uuid();

const isAiEnabled = process.env.NEXT_PUBLIC_LEGAL_DOC_AI_ENABLED === 'true';
const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_DOCS_BUCKET || 'patient-documents';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function buildStoragePath(patientId: string, fileName: string) {
  const safe = sanitizeFileName(fileName);
  const uuid = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `patients/${patientId}/legal/${uuid}-${safe}`;
}

export interface UploadLegalDocumentResult {
  document: Record<string, unknown>;
  log: Record<string, unknown>;
  filePath: string;
}

export async function uploadLegalDocument(
  patientId: string,
  relatedPersonId: string,
  file: File,
  options?: { title?: string; category?: string; metadata?: Json | null },
): Promise<UploadLegalDocumentResult> {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  const parsedRelated = relatedPersonIdSchema.safeParse(relatedPersonId);
  if (!parsedRelated.success) {
    throw new Error('ID do responsavel invalido (esperado UUID)');
  }

  if (!file) {
    throw new Error('Arquivo obrigatorio');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const filePath = buildStoragePath(parsedPatientId.data, file.name);
  const { error: uploadError } = await supabase.storage.from(storageBucket).upload(filePath, file, {
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) {
    throw new Error(`Falha ao enviar documento: ${uploadError.message}`);
  }

  const documentStatus = isAiEnabled ? 'uploaded' : 'manual_pending';
  const title = options?.title ?? file.name;
  const category = options?.category ?? 'legal';

  const { data: document, error: documentError } = await supabase
    .from('patient_documents')
    .insert({
      patient_id: parsedPatientId.data,
      related_object_id: parsedRelated.data,
      file_name: file.name,
      file_path: filePath,
      file_size_bytes: file.size,
      mime_type: file.type,
      title,
      category,
      document_status: documentStatus,
      document_validation_payload: options?.metadata ?? null,
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
    throw new Error('Falha ao registrar documento');
  }

  const { data: log, error: logError } = await supabase
    .from('patient_document_logs')
    .insert({
      document_id: document.id,
      action: 'uploaded',
      user_id: userId,
      details: {
        file_name: file.name,
        file_path: filePath,
        document_status: documentStatus,
        ai_enabled: isAiEnabled,
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

  if (!log) {
    throw new Error('Falha ao registrar log do documento');
  }

  return { document, log, filePath };
}
