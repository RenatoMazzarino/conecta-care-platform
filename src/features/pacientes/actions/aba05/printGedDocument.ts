import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';
import { generatePrintArtifact } from '@/features/pacientes/services/aba05/artifactGenerator';
import {
  buildArtifactStoragePath,
  computeSha256Hex,
  isDicomFile,
  resolveGedBucket,
  resolveTenantId,
} from './shared';

const documentIdSchema = z.string().uuid();

function formatUserDisplay(session: { user?: { email?: string | null; user_metadata?: Record<string, unknown> } } | null) {
  const metadata = session?.user?.user_metadata as Record<string, unknown> | undefined;
  const name = typeof metadata?.full_name === 'string' ? metadata.full_name : null;
  return name || session?.user?.email || 'Usuario autenticado';
}

export async function printGedDocument(documentId: string) {
  const parsed = documentIdSchema.safeParse(documentId);
  if (!parsed.success) {
    throw new Error('ID do documento invalido (esperado UUID)');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: document, error } = await supabase
    .from('patient_documents')
    .select('*')
    .eq('id', parsed.data)
    .is('deleted_at', null)
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

  if (!document.storage_path) {
    throw new Error('Documento sem storage_path');
  }

  if (!document.mime_type) {
    throw new Error('Tipo MIME do documento ausente');
  }

  if (isDicomFile(document.file_name ?? document.title ?? 'documento', document.mime_type)) {
    throw new Error('DICOM nao permite impressao; solicite o original');
  }

  const bucket = resolveGedBucket();
  const { data: fileBlob, error: downloadError } = await supabase.storage.from(bucket).download(document.storage_path);

  if (downloadError) {
    throw new Error(downloadError.message);
  }

  const fileBuffer = await fileBlob.arrayBuffer();
  const now = new Date();
  const watermarkText = `${formatUserDisplay(session)} • ${now.toISOString()} • ${document.tenant_id} • ${document.patient_id}`;

  const pdfBytes = await generatePrintArtifact(fileBuffer, document.mime_type, {
    bannerText: 'Documento em custodia Conecta Care',
    watermarkText,
  });

  const artifactHash = await computeSha256Hex(pdfBytes);
  const artifactId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const { tenantId } = await resolveTenantId(supabase, document.patient_id);
  const artifactPath = buildArtifactStoragePath(tenantId, document.patient_id, document.id, artifactId);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(artifactPath, pdfBytes, {
    upsert: false,
    contentType: 'application/pdf',
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  try {
    const { data: log, error: logError } = await supabase
      .from('patient_document_logs')
      .insert({
        document_id: document.id,
        action: 'print',
        user_id: userId,
        details: {
          artifact_id: artifactId,
          storage_path: artifactPath,
          file_hash: artifactHash,
          mime_type: 'application/pdf',
        } as Json,
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
      throw new Error('Falha ao registrar log de impressao');
    }

    const { error: artifactError } = await supabase.from('document_artifacts').insert({
      id: artifactId,
      patient_id: document.patient_id,
      document_id: document.id,
      document_log_id: log.id,
      artifact_type: 'print',
      storage_path: artifactPath,
      file_hash: artifactHash,
      file_size_bytes: pdfBytes.byteLength,
      mime_type: 'application/pdf',
      created_by: userId,
    });

    if (artifactError) {
      if (isTenantMissingError(artifactError)) {
        console.error('[patients] tenant_id ausente', artifactError);
        throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
      }
      throw new Error(artifactError.message);
    }

    const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(artifactPath, 60 * 10, {
      download: true,
    });

    return {
      artifactId,
      artifactPath,
      artifactUrl: signed?.signedUrl ?? null,
    };
  } catch (error) {
    await supabase.storage.from(bucket).remove([artifactPath]);
    throw error;
  }
}
