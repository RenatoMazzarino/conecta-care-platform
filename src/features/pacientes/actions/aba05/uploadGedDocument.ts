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

export async function uploadGedDocument(patientId: string, file: File, payload: GedUploadInput) {
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
    const extension = extractFileExtension(file.name);
    const documentStatus = 'Ativo';

    const { data: document, error: documentError } = await supabase
      .from('patient_documents')
      .insert({
        id: documentId,
        patient_id: parsedPatientId.data,
        file_name: file.name,
        file_path: storagePath,
        storage_path: storagePath,
        storage_provider: 'Supabase',
        file_size_bytes: file.size,
        mime_type: file.type,
        title: parsedPayload.title,
        description: parsedPayload.description ?? null,
        category: parsedPayload.category,
        subcategory: parsedPayload.doc_type,
        domain_type: parsedPayload.doc_domain,
        source_module: parsedPayload.doc_source,
        origin_module: parsedPayload.doc_origin,
        tags: parsedPayload.tags ?? null,
        file_hash: fileHash,
        file_extension: extension,
        extension,
        original_file_name: file.name,
        file_name_original: file.name,
        document_status: documentStatus,
        status: documentStatus,
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

    const { error: timeStampError } = await supabase.from('document_time_stamps').insert({
      document_id: document.id,
      document_hash: fileHash,
      provider: receipt.provider,
      receipt_payload: receipt.receipt_payload as Json,
      issued_at: receipt.issued_at,
      created_by: userId,
    });

    if (timeStampError) {
      if (isTenantMissingError(timeStampError)) {
        console.error('[patients] tenant_id ausente', timeStampError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(timeStampError.message);
    }

    const { error: logError } = await supabase.from('patient_document_logs').insert({
      document_id: document.id,
      action: 'upload',
      user_id: userId,
      details: {
        file_name: file.name,
        storage_path: storagePath,
        file_hash: fileHash,
        tsa_provider: receipt.provider,
        tsa_issued_at: receipt.issued_at,
      } as Json,
    });

    if (logError) {
      if (isTenantMissingError(logError)) {
        console.error('[patients] tenant_id ausente', logError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(logError.message);
    }

    return { document };
  } catch (error) {
    await supabase.storage.from(bucket).remove([storagePath]);
    throw error;
  }
}
