import JSZip from 'jszip';
import Papa from 'papaparse';
import { z } from 'zod';
import type { Json } from '@/types/supabase';
import { getSupabaseClient } from '@/lib/supabase/client';
import { ensureSession, isTenantMissingError, makeActionError, safeUserId } from '../aba03/shared';
import {
  gedManifestItemSchema,
  gedDocumentInputSchema,
  gedDocTypeOptions,
  resolveCategoryFromDocType,
  resolveDomainFromCategory,
} from '@/features/pacientes/schemas/aba05Ged.schema';
import {
  buildImportItemPath,
  buildImportZipPath,
  buildOriginalStoragePath,
  computeSha256Hex,
  extractFileExtension,
  resolveGedBucket,
  resolveTenantId,
  sanitizeFileName,
} from './shared';
import { resolveTimestampProvider } from '@/features/pacientes/services/aba05/timestampProvider';

const jobIdSchema = z.string().uuid();

const bulkImportScopeSchema = z.enum(['single', 'multi']);

export type BulkImportScope = z.infer<typeof bulkImportScopeSchema>;

function normalizeZipPath(path: string) {
  return path.replace(/^\.\//, '').trim();
}

function guessMimeType(fileName: string) {
  const ext = extractFileExtension(fileName);
  if (!ext) return 'application/octet-stream';
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'dcm':
      return 'application/dicom';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'csv':
      return 'text/csv';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

function inferDocTypeFromPath(path: string) {
  const lower = path.toLowerCase();
  const ordered = [...gedDocTypeOptions];
  for (const type of ordered) {
    if (lower.includes(type.replace('_', ' ')) || lower.includes(type)) {
      return type;
    }
  }
  if (lower.includes('receita')) return 'receita';
  if (lower.includes('exame')) return 'exame';
  if (lower.includes('laudo')) return 'laudo';
  if (lower.includes('evolucao')) return 'evolucao';
  if (lower.includes('prescricao')) return 'prescricao';
  if (lower.includes('contrato')) return 'contrato';
  if (lower.includes('autorizacao')) return 'autorizacao';
  if (lower.includes('fatura')) return 'fatura';
  if (lower.includes('comprovante')) return 'comprovante';
  if (lower.includes('identidade')) return 'identidade';
  if (lower.includes('consentimento')) return 'consentimento';
  if (lower.includes('juridic') || lower.includes('operadora')) return 'juridico_operadora';
  return null;
}

function inferDomainFromPath(path: string) {
  const lower = path.toLowerCase();
  if (lower.includes('clinico')) return 'Clinico';
  if (lower.includes('administrativo')) return 'Administrativo';
  if (lower.includes('financeiro')) return 'Administrativo';
  if (lower.includes('juridico')) return 'Administrativo';
  return null;
}

function inferTaxonomy(path: string) {
  const docType = inferDocTypeFromPath(path);
  if (!docType) return null;
  const category = resolveCategoryFromDocType(docType);
  const domain = inferDomainFromPath(path) ?? resolveDomainFromCategory(category);

  return {
    doc_type: docType,
    category,
    doc_domain: domain,
    doc_source: 'Importacao',
    doc_origin: 'Importacao',
  };
}

function parseManifestItems(raw: unknown) {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)) {
    return (raw as { items: unknown[] }).items;
  }
  return null;
}

async function parseManifest(zip: JSZip) {
  const manifestJson = zip.file('manifest.json');
  const manifestCsv = zip.file('manifest.csv');

  if (manifestJson) {
    const text = await manifestJson.async('text');
    const parsed = JSON.parse(text);
    const items = parseManifestItems(parsed);
    if (!items) {
      throw new Error('Manifest.json invalido');
    }
    return { items, type: 'json' as const, path: 'manifest.json' };
  }

  if (manifestCsv) {
    const text = await manifestCsv.async('text');
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });
    if (parsed.errors.length > 0) {
      throw new Error('Manifest.csv invalido');
    }
    return { items: parsed.data, type: 'csv' as const, path: 'manifest.csv' };
  }

  return { items: null, type: 'none' as const, path: null };
}

function normalizeManifestItem(item: Record<string, unknown>) {
  const normalized = {
    file_path: item.file_path ?? item.path ?? item.file ?? item.arquivo,
    title: item.title ?? item.titulo ?? item.nome,
    category: item.category ?? item.categoria,
    doc_type: item.doc_type ?? item.docType ?? item.tipo,
    doc_domain: item.doc_domain ?? item.docDomain ?? item.dominio,
    doc_source: item.doc_source ?? item.docSource ?? item.fonte,
    doc_origin: item.doc_origin ?? item.docOrigin ?? item.origem,
    patient_id: item.patient_id ?? item.patientId ?? item.paciente_id,
    description: item.description ?? item.descricao,
    tags: item.tags,
  };

  return normalized as Record<string, unknown>;
}

function buildManifestMap(items: unknown[]) {
  const map = new Map<string, { payload: Json; parsed: ReturnType<typeof gedManifestItemSchema.safeParse> }>();

  items.forEach((raw) => {
    const normalized = normalizeManifestItem((raw ?? {}) as Record<string, unknown>);
    const safe = gedManifestItemSchema.safeParse(normalized);
    const path = normalizeZipPath(String(normalized.file_path || ''));
    if (path) {
      map.set(path, { payload: normalized as Json, parsed: safe });
    }
  });

  return map;
}

async function createDocumentFromImport(params: {
  supabase: ReturnType<typeof getSupabaseClient>;
  documentId: string;
  patientId: string;
  userId: string | null;
  fileName: string;
  storagePath: string;
  fileBuffer: ArrayBuffer;
  mimeType: string;
  taxonomy: {
    category: string;
    doc_type: string;
    doc_domain: string;
    doc_source: string;
    doc_origin: string;
  };
  title?: string | null;
  description?: string | null;
  status: string;
  needsReview: boolean;
  manifestPayload?: Json | null;
}) {
  const { supabase } = params;
  const extension = extractFileExtension(params.fileName);
  const hash = await computeSha256Hex(params.fileBuffer);

  const { data: document, error } = await supabase
    .from('patient_documents')
    .insert({
      id: params.documentId,
      patient_id: params.patientId,
      file_name: params.fileName,
      file_path: params.storagePath,
      storage_path: params.storagePath,
      storage_provider: 'Supabase',
      file_size_bytes: params.fileBuffer.byteLength,
      mime_type: params.mimeType,
      title: params.title ?? params.fileName,
      description: params.description ?? null,
      category: params.taxonomy.category,
      subcategory: params.taxonomy.doc_type,
      domain_type: params.taxonomy.doc_domain,
      source_module: params.taxonomy.doc_source,
      origin_module: params.taxonomy.doc_origin,
      document_status: params.status,
      status: params.status,
      file_hash: hash,
      file_extension: extension,
      extension,
      original_file_name: params.fileName,
      file_name_original: params.fileName,
      uploaded_by: params.userId,
      created_by: params.userId,
      document_validation_payload: params.needsReview
        ? ({ needs_review: true, manifest_payload: params.manifestPayload ?? null } as Json)
        : null,
    })
    .select('*')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!document) {
    throw new Error('Falha ao criar documento do import');
  }

  return { document, hash };
}

export async function startGedBulkImport(
  scope: BulkImportScope,
  zipFile: File,
  patientId?: string | null,
) {
  const parsedScope = bulkImportScopeSchema.parse(scope);
  if (parsedScope === 'single' && !patientId) {
    throw new Error('patient_id obrigatorio para importacao single');
  }

  if (!zipFile) {
    throw new Error('ZIP obrigatorio');
  }

  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);
  const { tenantId } = await resolveTenantId(supabase, patientId ?? null);

  const { data: job, error: jobError } = await supabase
    .from('document_import_jobs')
    .insert({
      patient_id: patientId ?? null,
      status: 'queued',
      source: 'bulk_import',
      manifest_type: null,
      manifest_path: null,
      zip_storage_path: 'pending',
      created_by: userId,
    })
    .select('*')
    .maybeSingle();

  if (jobError) {
    if (isTenantMissingError(jobError)) {
      console.error('[patients] tenant_id ausente', jobError);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(jobError.message);
  }

  if (!job) {
    throw new Error('Falha ao criar job de importacao');
  }

  const bucket = resolveGedBucket();
  const zipPath = buildImportZipPath(tenantId, job.id, zipFile.name || 'import.zip');

  const { error: uploadError } = await supabase.storage.from(bucket).upload(zipPath, zipFile, {
    upsert: false,
    contentType: zipFile.type || 'application/zip',
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const zip = await JSZip.loadAsync(zipFile);
  const manifest = await parseManifest(zip);

  if (parsedScope === 'multi' && manifest.type === 'none') {
    await supabase
      .from('document_import_jobs')
      .update({
        status: 'failed',
        zip_storage_path: zipPath,
        metadata: { error: 'Manifest obrigatorio para multi-paciente' } as Json,
      })
      .eq('id', job.id);
    throw new Error('Manifest obrigatorio para importacao multi-paciente');
  }

  const manifestMap = manifest.items ? buildManifestMap(manifest.items) : new Map();
  const files = Object.values(zip.files).filter((file) => !file.dir);
  const provider = resolveTimestampProvider();

  let total = 0;
  let processed = 0;
  let failed = 0;
  let needsReview = 0;

  await supabase
    .from('document_import_jobs')
    .update({
      status: 'processing',
      started_at: new Date().toISOString(),
      zip_storage_path: zipPath,
      manifest_type: manifest.type,
      manifest_path: manifest.path,
    })
    .eq('id', job.id);

  for (const file of files) {
    const filePath = normalizeZipPath(file.name);
    if (filePath === 'manifest.json' || filePath === 'manifest.csv') {
      continue;
    }

    total += 1;

    const manifestEntry = manifestMap.get(filePath);
    const manifestPayload = manifestEntry?.payload ?? null;
    const manifestParsed = manifestEntry?.parsed ?? null;

    const { data: item, error: itemError } = await supabase
      .from('document_import_job_items')
      .insert({
        job_id: job.id,
        patient_id: manifestParsed?.success ? manifestParsed.data.patient_id ?? null : null,
        file_path: filePath,
        original_file_name: filePath.split('/').pop() ?? filePath,
        status: 'processing',
        manifest_payload: manifestPayload,
      })
      .select('*')
      .maybeSingle();

    if (itemError || !item) {
      failed += 1;
      continue;
    }

    try {
      const fileBuffer = await file.async('arraybuffer');
      const fileName = sanitizeFileName(item.original_file_name ?? filePath.split('/').pop() ?? 'arquivo');
      const mimeType = guessMimeType(fileName);
      const checksum = await computeSha256Hex(fileBuffer);

      const itemStoragePath = buildImportItemPath(tenantId, job.id, item.id, fileName);

      const { error: fileUploadError } = await supabase.storage.from(bucket).upload(itemStoragePath, fileBuffer, {
        upsert: false,
        contentType: mimeType,
      });

      if (fileUploadError) {
        throw new Error(fileUploadError.message);
      }

      const taxonomyFromManifest = manifestParsed?.success ? manifestParsed.data : null;
      const fallbackTaxonomy = inferTaxonomy(filePath);

      const patientIdResolved =
        parsedScope === 'single'
          ? patientId
          : taxonomyFromManifest?.patient_id ?? item.patient_id ?? null;

      if (!patientIdResolved) {
        needsReview += 1;
        await supabase
          .from('document_import_job_items')
          .update({
            status: 'needs_review',
            checksum_sha256: checksum,
            file_size_bytes: fileBuffer.byteLength,
            mime_type: mimeType,
            error_code: 'PATIENT_MISSING',
            error_detail: 'patient_id ausente',
            inferred_taxonomy: fallbackTaxonomy as Json,
            processed_at: new Date().toISOString(),
          })
          .eq('id', item.id);
        continue;
      }

      let taxonomy = taxonomyFromManifest
        ? {
            category: taxonomyFromManifest.category,
            doc_type: taxonomyFromManifest.doc_type,
            doc_domain: taxonomyFromManifest.doc_domain,
            doc_source: taxonomyFromManifest.doc_source,
            doc_origin: taxonomyFromManifest.doc_origin,
          }
        : fallbackTaxonomy;

      const needsReviewItem = !taxonomy;
      if (!taxonomy) {
        taxonomy = {
          category: 'other',
          doc_type: 'outros',
          doc_domain: 'Misto',
          doc_source: 'Importacao',
          doc_origin: 'Importacao',
        };
      }

      const normalizedTaxonomy = gedDocumentInputSchema.pick({
        category: true,
        doc_type: true,
        doc_domain: true,
        doc_source: true,
        doc_origin: true,
        title: true,
      }).safeParse({
        title: taxonomyFromManifest?.title ?? fileName,
        category: taxonomy.category,
        doc_type: taxonomy.doc_type,
        doc_domain: taxonomy.doc_domain,
        doc_source: taxonomy.doc_source,
        doc_origin: taxonomy.doc_origin,
      });

      const needsReviewFlag = needsReviewItem || !normalizedTaxonomy.success;
      if (needsReviewFlag) {
        needsReview += 1;
      }

      if (!normalizedTaxonomy.success) {
        taxonomy = {
          category: 'other',
          doc_type: 'outros',
          doc_domain: 'Misto',
          doc_source: 'Importacao',
          doc_origin: 'Importacao',
        };
      }

      const status = needsReviewFlag ? 'Rascunho' : 'Ativo';

      const documentId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const storagePath = buildOriginalStoragePath(tenantId, patientIdResolved, documentId, 1, fileName);
      const { error: finalUploadError } = await supabase.storage.from(bucket).upload(storagePath, fileBuffer, {
        upsert: false,
        contentType: mimeType,
      });

      if (finalUploadError) {
        throw new Error(finalUploadError.message);
      }

      const { document, hash } = await createDocumentFromImport({
        supabase,
        documentId,
        patientId: patientIdResolved,
        userId,
        fileName,
        storagePath,
        fileBuffer,
        mimeType,
        taxonomy: taxonomy,
        title: taxonomyFromManifest?.title ?? fileName,
        description: taxonomyFromManifest?.description ?? null,
        status,
        needsReview: status === 'Rascunho',
        manifestPayload: manifestPayload,
      });

      const receipt = await provider.stamp({
        documentHash: hash,
        fileName,
        mimeType,
      });

      await supabase.from('document_time_stamps').insert({
        document_id: document.id,
        document_hash: hash,
        provider: receipt.provider,
        receipt_payload: receipt.receipt_payload as Json,
        issued_at: receipt.issued_at,
        created_by: userId,
      });

      await supabase.from('patient_document_logs').insert({
        document_id: document.id,
        action: 'upload',
        user_id: userId,
        details: {
          source: 'bulk_import',
          file_path: filePath,
          storage_path: storagePath,
          file_hash: hash,
        } as Json,
      });

      await supabase
        .from('document_import_job_items')
        .update({
          status: status === 'Rascunho' ? 'needs_review' : 'imported',
          document_id: document.id,
          checksum_sha256: checksum,
          file_size_bytes: fileBuffer.byteLength,
          mime_type: mimeType,
          inferred_taxonomy: fallbackTaxonomy as Json,
          processed_at: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (status !== 'Rascunho') {
        processed += 1;
      }
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'Falha no item';
      await supabase
        .from('document_import_job_items')
        .update({
          status: 'failed',
          error_code: 'PROCESSING_ERROR',
          error_detail: message.slice(0, 200),
          processed_at: new Date().toISOString(),
        })
        .eq('id', item.id);
    }
  }

  const finalStatus = failed > 0 ? 'completed_with_errors' : 'completed';

  await supabase
    .from('document_import_jobs')
    .update({
      status: finalStatus,
      total_items: total,
      processed_items: processed,
      failed_items: failed,
      needs_review_items: needsReview,
      finished_at: new Date().toISOString(),
    })
    .eq('id', job.id);

  return {
    jobId: job.id,
    status: finalStatus,
    totalItems: total,
    processedItems: processed,
    failedItems: failed,
    needsReviewItems: needsReview,
  };
}

export async function getBulkImportJob(jobId: string) {
  const parsed = jobIdSchema.safeParse(jobId);
  if (!parsed.success) {
    throw new Error('ID do job invalido');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data, error } = await supabase
    .from('document_import_jobs')
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

  if (!data) {
    throw new Error('Job nao encontrado');
  }

  return data;
}

export async function listBulkImportItems(jobId: string) {
  const parsed = jobIdSchema.safeParse(jobId);
  if (!parsed.success) {
    throw new Error('ID do job invalido');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { data, error } = await supabase
    .from('document_import_job_items')
    .select('*')
    .eq('job_id', parsed.data)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    if (isTenantMissingError(error)) {
      console.error('[patients] tenant_id ausente', error);
      throw makeActionError('TENANT_MISSING', 'Conta sem organizacao vinculada (tenant)');
    }
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function reviewBulkImportItem(
  itemId: string,
  payload: z.infer<typeof gedDocumentInputSchema>,
  patientIdOverride?: string | null,
) {
  const parsedItemId = jobIdSchema.safeParse(itemId);
  if (!parsedItemId.success) {
    throw new Error('ID do item invalido');
  }

  const parsedPayload = gedDocumentInputSchema.parse(payload);
  const supabase = getSupabaseClient();
  const session = await ensureSession(supabase);
  const userId = safeUserId(session);

  const { data: item, error: itemError } = await supabase
    .from('document_import_job_items')
    .select('*')
    .eq('id', parsedItemId.data)
    .maybeSingle();

  if (itemError) {
    throw new Error(itemError.message);
  }

  if (!item) {
    throw new Error('Item nao encontrado');
  }

  const { data: job, error: jobError } = await supabase
    .from('document_import_jobs')
    .select('*')
    .eq('id', item.job_id)
    .maybeSingle();

  if (jobError) {
    throw new Error(jobError.message);
  }

  const resolvedPatientId = patientIdOverride ?? item.patient_id ?? job?.patient_id ?? null;
  if (!resolvedPatientId) {
    throw new Error('patient_id obrigatorio para revisar item');
  }

  if (item.document_id) {
    const { error: updateError } = await supabase
      .from('patient_documents')
      .update({
        title: parsedPayload.title,
        description: parsedPayload.description ?? null,
        category: parsedPayload.category,
        subcategory: parsedPayload.doc_type,
        domain_type: parsedPayload.doc_domain,
        source_module: parsedPayload.doc_source,
        origin_module: parsedPayload.doc_origin,
        document_status: 'Ativo',
        status: 'Ativo',
        updated_by: userId,
      })
      .eq('id', item.document_id)
      .is('deleted_at', null);

    if (updateError) {
      throw new Error(updateError.message);
    }

    await supabase
      .from('document_import_job_items')
      .update({
        status: 'imported',
        processed_at: new Date().toISOString(),
        patient_id: resolvedPatientId,
      })
      .eq('id', item.id);

    return { ok: true };
  }

  const bucket = resolveGedBucket();
  const tenant = await resolveTenantId(supabase, resolvedPatientId);
  const fileName = sanitizeFileName(item.original_file_name ?? item.file_path.split('/').pop() ?? 'arquivo');
  const importPath = buildImportItemPath(tenant.tenantId, item.job_id, item.id, fileName);
  const { data: fileBlob, error: downloadError } = await supabase.storage.from(bucket).download(importPath);

  if (downloadError || !fileBlob) {
    throw new Error(downloadError?.message || 'Falha ao carregar item do storage');
  }

  const fileBuffer = await fileBlob.arrayBuffer();
  const mimeType = guessMimeType(fileName);
  const documentId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const storagePath = buildOriginalStoragePath(tenant.tenantId, resolvedPatientId, documentId, 1, fileName);

  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, fileBuffer, {
    upsert: false,
    contentType: mimeType,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { document, hash } = await createDocumentFromImport({
    supabase,
    documentId,
    patientId: resolvedPatientId,
    userId,
    fileName,
    storagePath,
    fileBuffer,
    mimeType,
    taxonomy: {
      category: parsedPayload.category,
      doc_type: parsedPayload.doc_type,
      doc_domain: parsedPayload.doc_domain,
      doc_source: parsedPayload.doc_source,
      doc_origin: parsedPayload.doc_origin,
    },
    title: parsedPayload.title,
    description: parsedPayload.description ?? null,
    status: 'Ativo',
    needsReview: false,
  });

  const provider = resolveTimestampProvider();
  const receipt = await provider.stamp({ documentHash: hash, fileName, mimeType });

  await supabase.from('document_time_stamps').insert({
    document_id: document.id,
    document_hash: hash,
    provider: receipt.provider,
    receipt_payload: receipt.receipt_payload as Json,
    issued_at: receipt.issued_at,
    created_by: userId,
  });

  await supabase.from('patient_document_logs').insert({
    document_id: document.id,
    action: 'upload',
    user_id: userId,
    details: { source: 'bulk_import_review', storage_path: storagePath, file_hash: hash } as Json,
  });

  await supabase
    .from('document_import_job_items')
    .update({
      status: 'imported',
      processed_at: new Date().toISOString(),
      patient_id: resolvedPatientId,
      document_id: document.id,
    })
    .eq('id', item.id);

  return { ok: true };
}

export async function retryBulkImportItem(itemId: string) {
  const parsedItemId = jobIdSchema.safeParse(itemId);
  if (!parsedItemId.success) {
    throw new Error('ID do item invalido');
  }

  const supabase = getSupabaseClient();
  await ensureSession(supabase);

  const { error } = await supabase
    .from('document_import_job_items')
    .update({
      status: 'queued',
      attempts: 0,
      error_code: null,
      error_detail: null,
    })
    .eq('id', parsedItemId.data);

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}
