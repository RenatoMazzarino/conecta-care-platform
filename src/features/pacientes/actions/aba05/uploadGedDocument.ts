import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';
import { gedDocumentInputSchema } from '@/features/pacientes/schemas/aba05Ged.schema';
import {
  buildOriginalStoragePath,
  computeSha256Hex,
  extractFileExtension,
  resolveGedBucket,
  resolveTenantId,
} from './shared';
import { resolveTimestampProvider } from '@/features/pacientes/services/aba05/timestampProvider';

const patientIdSchema = z.string().uuid();

export type GedUploadInput = z.infer<typeof gedDocumentInputSchema>;

export async function uploadGedDocument(
  patientId: string,
  file: File,
  payload: GedUploadInput,
  folderId?: string | null,
) {
  const parsedPatientId = patientIdSchema.safeParse(patientId);
  if (!parsedPatientId.success) {
    throw new Error('ID do paciente invalido (esperado UUID)');
  }

  if (!file) {
    throw new Error('Arquivo obrigatorio');
  }

  const parsedPayload = gedDocumentInputSchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);
  if (!userId) {
    throw new Error('Usuario nao autenticado');
  }
  const { tenantId } = await resolveTenantId(supabase, parsedPatientId.data);

  const fileBuffer = await file.arrayBuffer();
  const fileHash = await computeSha256Hex(fileBuffer);

  const provider = resolveTimestampProvider();
  const receipt = await provider.stamp({
    documentHash: fileHash,
    fileName: file.name,
    mimeType: file.type,
  });

  const version = 1;
  const documentId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const storagePath = buildOriginalStoragePath(tenantId, parsedPatientId.data, documentId, version, file.name);
  const bucket = resolveGedBucket();

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
    upsert: false,
    contentType: file.type,
  });

  if (uploadError) {
    throw new Error(`Falha ao enviar documento: ${uploadError.message}`);
  }

  try {
    const extension = extractFileExtension(file.name) ?? 'bin';
    const documentStatus = 'Ativo';

    const { data: bundle, error: bundleError } = await supabase.rpc('create_ged_document_bundle', {
      p_document_id: documentId,
      p_patient_id: parsedPatientId.data,
      p_folder_id: folderId ?? null,
      p_file_name: file.name,
      p_storage_path: storagePath,
      p_storage_provider: 'Supabase',
      p_file_size_bytes: file.size,
      p_mime_type: file.type,
      p_title: parsedPayload.title,
      p_description: parsedPayload.description ?? null,
      p_category: parsedPayload.category,
      p_doc_type: parsedPayload.doc_type,
      p_doc_domain: parsedPayload.doc_domain,
      p_doc_source: parsedPayload.doc_source,
      p_doc_origin: parsedPayload.doc_origin,
      p_tags: parsedPayload.tags ?? null,
      p_file_hash: fileHash,
      p_file_extension: extension,
      p_extension: extension,
      p_original_file_name: file.name,
      p_uploaded_by: userId,
      p_created_by: userId,
      p_document_status: documentStatus,
      p_status: documentStatus,
      p_document_validation_payload: null,
      p_log_action: 'upload',
      p_log_details: {
        file_name: file.name,
        storage_path: storagePath,
        file_hash: fileHash,
        tsa_provider: receipt.provider,
        tsa_issued_at: receipt.issued_at,
      } as Json,
      p_tsa_provider: receipt.provider,
      p_tsa_payload: receipt.receipt_payload as Json,
      p_tsa_issued_at: receipt.issued_at,
    });

    if (bundleError) {
      if (isTenantMissingError(bundleError)) {
        console.error('[patients] tenant_id ausente', bundleError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(bundleError.message);
    }

    if (!bundle) {
      throw new Error('Falha ao registrar documento');
    }

    return { documentId };
  } catch (error) {
    await supabase.storage.from(bucket).remove([storagePath]);
    throw error;
  }
}
